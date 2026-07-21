import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth }      from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { v2 as cloudinary } from "cloudinary";

/* ── Firebase Admin ───────────────────────────────────── */
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

/* ── Cloudinary ───────────────────────────────────────── */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* ── Vercel body-parser cap ──────────────────────────────
   A 2MB image, base64-encoded, comes out to ~2.7MB of text,
   plus a little JSON overhead. 3.5mb gives real uploads room
   while still rejecting grossly oversized payloads before our
   handler code (and Cloudinary) ever sees them. The *real*
   2MB limit is enforced below, on the decoded byte length. */
export const config = {
  api: { bodyParser: { sizeLimit: "3.5mb" } },
};

const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB
const MAX_CHANGES_PER_DAY = 3;

/* ── Strict allow-list of accepted mime types in the data URI.
   Deliberately excludes svg+xml (can carry embedded scripts). ── */
const DATA_URI_RE = /^data:image\/(jpeg|jpg|png|webp|gif);base64,([A-Za-z0-9+/=]+)$/;

/* ── Sniff the real file type from its magic bytes — the only
   reliable way to know what a file actually is; an extension
   or a declared mime type can be anything the client wants it
   to say. Returns null if it doesn't recognize the signature. ── */
function detectImageType(buf) {
  if (buf.length >= 3 && buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) {
    return "jpeg";
  }
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47 &&
    buf[4] === 0x0D && buf[5] === 0x0A && buf[6] === 0x1A && buf[7] === 0x0A
  ) {
    return "png";
  }
  if (
    buf.length >= 6 &&
    buf.toString("ascii", 0, 3) === "GIF" &&
    (buf.toString("ascii", 3, 6) === "87a" || buf.toString("ascii", 3, 6) === "89a")
  ) {
    return "gif";
  }
  if (
    buf.length >= 12 &&
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "webp";
  }
  return null;
}

/* ── Parse + fully validate the incoming data URI.
   Throws a { status, message } style error on any failure so the
   handler can just catch once and respond. ── */
function parseAndValidateImage(image) {
  if (!image || typeof image !== "string") {
    throw { status: 400, message: "No image provided." };
  }

  const match = image.match(DATA_URI_RE);
  if (!match) {
    throw { status: 400, message: "Unsupported image format. Use JPEG, PNG, WEBP or GIF." };
  }

  const declaredType = match[1] === "jpg" ? "jpeg" : match[1];

  let buffer;
  try {
    buffer = Buffer.from(match[2], "base64");
  } catch {
    throw { status: 400, message: "Couldn't read the image data." };
  }

  if (!buffer.length) {
    throw { status: 400, message: "The image appears to be empty." };
  }

  if (buffer.length > MAX_IMAGE_BYTES) {
    throw { status: 400, message: "Image is too large — please choose a photo under 2MB." };
  }

  const actualType = detectImageType(buffer);
  if (!actualType) {
    throw { status: 400, message: "That file doesn't look like a valid image." };
  }
  if (actualType !== declaredType) {
    // The bytes don't match what the request claimed they were — reject outright.
    throw { status: 400, message: "Image content doesn't match its declared format." };
  }

  return buffer;
}

/* ── "Today" in a fixed timezone, as YYYY-MM-DD.
   en-CA formats as ISO (YYYY-MM-DD) — used purely as a stable,
   easily-comparable day key. Change the timeZone here if needed. ── */
function todayKey() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Cairo" });
}

/* ── Reserve one of today's 3 photo-change slots *before* we spend
   any time/money talking to Cloudinary. Atomic via a transaction so
   two concurrent requests can't both slip through. Resets the
   counter automatically whenever the stored date != today. ── */
async function reserveDailyPhotoSlot(uid) {
  const db = getFirestore();
  const userRef = db.collection("users").doc(uid);
  const today = todayKey();

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(userRef);
    if (!snap.exists) {
      throw { status: 404, message: "User not found." };
    }

    const data = snap.data();
    const sameDay = data.photoChangeDate === today;
    const currentCount = sameDay ? (data.photoChangeCount || 0) : 0;

    if (currentCount >= MAX_CHANGES_PER_DAY) {
      throw {
        status: 429,
        message: `You've already changed your profile photo ${MAX_CHANGES_PER_DAY} times today. Try again tomorrow.`,
      };
    }

    tx.update(userRef, {
      photoChangeCount: currentCount + 1,
      photoChangeDate: today,
    });
  });
}

/* ── Best-effort rollback if Cloudinary fails *after* we reserved a
   slot — the user shouldn't lose one of their 3 daily changes to a
   server-side error that wasn't their fault. ── */
async function releaseDailyPhotoSlot(uid) {
  try {
    const db = getFirestore();
    const userRef = db.collection("users").doc(uid);
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(userRef);
      if (!snap.exists) return;
      const data = snap.data();
      if (data.photoChangeDate !== todayKey()) return; // day already rolled over, nothing to undo
      const current = data.photoChangeCount || 0;
      tx.update(userRef, { photoChangeCount: Math.max(0, current - 1) });
    });
  } catch (err) {
    console.error("Failed to release photo slot after upload error:", err);
  }
}

/* ═══════════════════════════════════════════════════════
   POST /api/upload-profile
   Body  (JSON): { image: "data:image/jpeg;base64,..." }
   Auth  header: Authorization: Bearer <Firebase ID token>
═══════════════════════════════════════════════════════ */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  /* 1. Verify Firebase ID token */
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  let uid;
  try {
    const decoded = await getAuth().verifyIdToken(token);
    uid = decoded.uid;
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  /* 2. Validate the image is really an image (magic bytes, not just
        the file extension / declared mime type) and under 2MB. */
  try {
    parseAndValidateImage(req.body?.image);
  } catch (err) {
    const status = err?.status || 400;
    return res.status(status).json({ error: err?.message || "Invalid image." });
  }

  /* 3. Reserve today's slot (max 3 changes/day) BEFORE calling
        Cloudinary, so a rejected image never costs the user a slot. */
  try {
    await reserveDailyPhotoSlot(uid);
  } catch (err) {
    const status = err?.status || 500;
    return res.status(status).json({ error: err?.message || "Something went wrong." });
  }

  /* 4. Upload to Cloudinary — same public_id every time + overwrite
        + invalidate replaces the previous photo everywhere (CDN
        included), so there's never more than one photo per user. */
  let url;
  try {
    const result = await cloudinary.uploader.upload(req.body.image, {
      folder:      "gymcoach/profiles",
      public_id:   `user_${uid}`,
      overwrite:   true,
      invalidate:  true,
      transformation: [
        {
          width:   600,
          height:  800,
          crop:    "fill",
          gravity: "face",
          quality: "auto",
          fetch_format: "auto",
        },
      ],
    });
    url = result.secure_url;
  } catch (err) {
    console.error("Cloudinary error:", err);
    await releaseDailyPhotoSlot(uid);
    return res.status(500).json({ error: "Image upload failed. Please try again." });
  }

  /* 5. Save URL to Firestore users/{uid}.img */
  try {
    await getFirestore().collection("users").doc(uid).update({ img: url });
  } catch (err) {
    console.error("Firestore error:", err);
    return res.status(500).json({ error: "Failed to save image URL" });
  }

  return res.status(200).json({ url });
}