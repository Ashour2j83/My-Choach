import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    }),
  });
}

const db = admin.firestore();

function parseUserAgent(ua = "") {
  let browser = "Unknown";
  if (/edg/i.test(ua))                                    browser = "Edge";
  else if (/chrome|crios/i.test(ua) && !/edg/i.test(ua))   browser = "Chrome";
  else if (/firefox|fxios/i.test(ua))                      browser = "Firefox";
  else if (/safari/i.test(ua) && !/chrome|crios|android/i.test(ua)) browser = "Safari";
  else if (/opr\//i.test(ua))                              browser = "Opera";

  let os = "Unknown";
  if (/windows/i.test(ua))                                 os = "Windows";
  else if (/mac os x/i.test(ua) && !/iphone|ipad/i.test(ua)) os = "macOS";
  else if (/android/i.test(ua))                            os = "Android";
  else if (/iphone|ipad|ipod/i.test(ua))                   os = "iOS";
  else if (/linux/i.test(ua))                              os = "Linux";

  return { browser, os };
}

function getClientIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (fwd) return fwd.split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { idToken, deviceId } = req.body || {};
    if (!idToken || !deviceId) {
      return res.status(400).json({ error: "Missing idToken or deviceId" });
    }

    // تحقق حقيقي إن الطلب جاي من يوزر مسجل دخول فعلاً (بديل بسيط وآمن عن App Check)
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    const ip        = getClientIp(req);
    const userAgent = req.headers["user-agent"] || "unknown";
    const { browser, os } = parseUserAgent(userAgent);
    const now = admin.firestore.FieldValue.serverTimestamp();

    // doc id ثابت = uid_deviceId عشان نقدر نجيب السجل مباشرة من غير query
    const docId     = `${uid}_${deviceId}`;
    const deviceRef = db.collection("devices").doc(docId);
    const snap      = await deviceRef.get();

    /* ── جهاز جديد تمامًا (مفيش سجل بالـ deviceId ده) ── */
    if (!snap.exists) {
      const existingDevices = await db.collection("devices").where("uid", "==", uid).limit(1).get();
      const isFirstDeviceEver = existingDevices.empty;

      await deviceRef.set({
        uid, deviceId, ip, userAgent, browser, os,
        firstLogin: now,
        lastLogin:  now,
        trusted: isFirstDeviceEver, // أول جهاز = موثوق تلقائي
        blocked: false,
      });

      if (isFirstDeviceEver) {
        return res.status(200).json({ allow: true, status: "first_device" });
      }
      return res.status(200).json({ allow: false, status: "new_device_pending" });
    }

    const device = snap.data();

    /* ── جهاز محظور ── */
    if (device.blocked) {
      return res.status(200).json({ allow: false, status: "blocked" });
    }

    /* ── جهاز لسه مستني موافقة (already pending) ── */
    if (!device.trusted) {
      await deviceRef.update({ ip, userAgent, browser, os, lastLogin: now });
      return res.status(200).json({ allow: false, status: "new_device_pending" });
    }

    /* ── جهاز موثوق ── */
    await deviceRef.update({ ip, userAgent, browser, os, lastLogin: now });
    return res.status(200).json({ allow: true, status: "trusted" });

  } catch (err) {
    console.error("verify-device error:", err);
    return res.status(500).json({ error: "Internal error" });
  }
}