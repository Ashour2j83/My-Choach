// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

// Your web app's Firebase configuration
// Values now come from Vite env vars — see the "Vercel" section at the
// bottom of this file for how to set them.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

/* ── App Check (reCAPTCHA v3) ──────────────────────────────────────
   This only carries the PUBLIC site key — the secret key lives in
   Firebase Console → App Check → your app → reCAPTCHA v3 provider,
   never in code.

   On localhost, App Check will reject every request until you add a
   debug token (see console instructions on first run, or the note
   below). Don't skip that step or local dev breaks the moment you
   flip Enforcement on in the console. */
if (typeof window !== "undefined") {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(
      import.meta.env.VITE_RECAPTCHA_SITE_KEY
    ),
    isTokenAutoRefreshEnabled: true,
  });
}

// Export the services we'll use across the app
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;

/* ═══════════════════════════════════════════════════════════════════
   VERCEL — moving these values into Environment Variables
   ═══════════════════════════════════════════════════════════════════

   1. Local development (.env.local in your project root — never commit this file):

      VITE_FIREBASE_API_KEY=AIzaSyDU9CLz2L_Mqur9ifGzc0fbbKkHhuTHjT0
      VITE_FIREBASE_AUTH_DOMAIN=my-coach-9394a.firebaseapp.com
      VITE_FIREBASE_PROJECT_ID=my-coach-9394a
      VITE_FIREBASE_STORAGE_BUCKET=my-coach-9394a.firebasestorage.app
      VITE_FIREBASE_MESSAGING_SENDER_ID=67025439273
      VITE_FIREBASE_APP_ID=1:67025439273:web:4bc33bfe58c708c3be2a38
      VITE_RECAPTCHA_SITE_KEY=6Lc1W14tAAAAAJvWGlIZ4u390rijDTHCkq_gux_D

      Add ".env.local" to .gitignore if it isn't already there.

   2. Production (Vercel dashboard):
      Project → Settings → Environment Variables → add each of the 7
      keys above with the same values, scoped to "Production" (and
      "Preview" if you want preview deployments to work too).
      Redeploy after adding them — Vite bakes env vars in at build
      time, so they don't apply retroactively to an existing deploy.

   Note: Vite only exposes env vars prefixed with VITE_ to client code
   — that's intentional, it's how Vite stops you from accidentally
   shipping a real secret (like the App Check secret key) into the
   browser bundle.
   ═══════════════════════════════════════════════════════════════════ */