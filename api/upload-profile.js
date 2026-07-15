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

/* ── Vercel body-parser: accept up to 10 MB ──────────── */
export const config = {
  api: { bodyParser: { sizeLimit: "10mb" } },
};

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

  /* 2. Validate image data */
  const { image } = req.body ?? {};
  if (!image || !image.startsWith("data:image/")) {
    return res.status(400).json({ error: "Invalid image. Send a base64 data URI." });
  }

  /* 3. Upload to Cloudinary */
  let url;
  try {
    const result = await cloudinary.uploader.upload(image, {
      folder:      "gymcoach/profiles",
      public_id:   `user_${uid}`,
      overwrite:   true,
      // Auto-crop to face, 600×800, auto quality & format
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
    return res.status(500).json({ error: "Image upload failed" });
  }

  /* 4. Save URL to Firestore users/{uid}.img */
  try {
    await getFirestore().collection("users").doc(uid).update({ img: url });
  } catch (err) {
    console.error("Firestore error:", err);
    return res.status(500).json({ error: "Failed to save image URL" });
  }

  return res.status(200).json({ url });
}