import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/config";
import "../styles/auth.css";

function getDeviceId() {
  let id = localStorage.getItem("gc_device_id");
  if (!id) {
    id = (typeof crypto !== "undefined" && crypto.randomUUID)
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("gc_device_id", id);
  }
  return id;
}

export default function Login() {
  const { login, logout, resendVerification } = useAuth();
  const navigate = useNavigate();

  const [email,      setEmail]      = useState("");
  const [password,   setPassword]   = useState("");
  const [error,      setError]      = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [resendSent, setResendSent] = useState(false);

  async function handleResend() {
    try {
      await resendVerification();
      setResendSent(true);
    } catch {
      // fail silently
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setResendSent(false);

    try {
      setLoading(true);

      const result = await login(email, password);
      const firebaseUser = result.user;

      await firebaseUser.reload();

      if (!firebaseUser.emailVerified) {
        await logout();
        setError({ type: "verify" });
        setLoading(false);
        return;
      }

      /* ── فحص الجهاز قبل أي حاجة تانية ── */
      try {
        const idToken  = await firebaseUser.getIdToken();
        const deviceId = getDeviceId();

        const resp = await fetch("/api/verify-device", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken, deviceId }),
        });
        const deviceResult = await resp.json();

        if (!deviceResult.allow) {
          await logout();
          if (deviceResult.status === "blocked") {
            setError({ type: "device-blocked" });
          } else {
            setError({ type: "device-pending" });
          }
          setLoading(false);
          return;
        }
      } catch (deviceErr) {
        // لو الـ API نفسه وقع، منمنعش اليوزر من الدخول عشانه — بس نسجل الخطأ
        console.error("Device check failed:", deviceErr);
      }

      const snap = await getDoc(doc(db, "users", firebaseUser.uid));

      if (!snap.exists()) {
        await logout();
        setError({ type: "generic", message: "Account not found. Please sign up again." });
        setLoading(false);
        return;
      }

      const userData = snap.data();

      if (userData.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }

    } catch (err) {
      switch (err.code) {
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
          setError({ type: "generic", message: "Incorrect email or password." });
          break;
        case "auth/too-many-requests":
          setError({ type: "generic", message: "Too many attempts. Try again in a few minutes." });
          break;
        case "auth/invalid-email":
          setError({ type: "generic", message: "Please enter a valid email address." });
          break;
        default:
          setError({ type: "generic", message: "Something went wrong. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-bg">
      <div className="auth-card">

        {/* ── TOP: gym photo ── */}
        <div className="card-top">
          <div className="card-top-inner">

            <div className="ct-brand">
              <div className="ct-brand-icon">🏋️</div>
              <div className="ct-brand-name">GymCoach</div>
            </div>

            <div className="ct-tagline">
              Your <span className="accent">transformation</span> starts here
            </div>
            <div className="ct-desc">
              Everything Bahaa built for you — waiting on the other side.
            </div>

            <div className="ct-coach">
              <div className="ct-coach-av">🏋️</div>
              <div className="ct-coach-info">
                <div className="ct-coach-name">Coach Bahaa</div>
                <div className="ct-coach-title">Certified Nutrition & Fitness Coach</div>
              </div>
              <div className="ct-coach-stats">
                <div className="ct-coach-stat"><div className="sv">250+</div><div className="sl">Clients</div></div>
                <div className="ct-coach-stat"><div className="sv">8</div><div className="sl">Years</div></div>
              </div>
            </div>

            <div className="ct-pills">
              <div className="ct-pill"><span className="ct-pill-icon">🥗</span> Nutrition Plan</div>
              <div className="ct-pill"><span className="ct-pill-icon">📅</span> Weekly Sessions</div>
              <div className="ct-pill"><span className="ct-pill-icon">🤖</span> AI Coach</div>
            </div>

          </div>
        </div>

        {/* ── FORM ── */}
        <div className="card-form">
          <div className="cf-title">Welcome back</div>
          <div className="cf-sub">
            Back to your fitness journey.{" "}
            <Link to="/signup">New here? Sign up</Link>
          </div>

          {/* Not verified */}
          {error?.type === "verify" && (
            <div className="auth-notice verify">
              <div className="notice-icon">📩</div>
              <div className="notice-body">
                <div className="notice-title">Verify your email first ✨</div>
                <div className="notice-sub">
                  We sent a link to <b>{email}</b> — open it then come back to sign in.
                </div>
                {resendSent ? (
                  <div className="notice-sent">✅ New email sent! Check your inbox.</div>
                ) : (
                  <button className="notice-resend" onClick={handleResend}>
                    Didn't receive it? Resend →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* New device — pending approval */}
          {error?.type === "device-pending" && (
            <div className="auth-notice verify">
              <div className="notice-icon">🔐</div>
              <div className="notice-body">
                <div className="notice-title">New device detected</div>
                <div className="notice-sub">
                  We noticed you're signing in from a new device. Coach Bahaa needs to approve
                  it first — you'll be able to log in right after.
                </div>
              </div>
            </div>
          )}

          {/* Blocked device */}
          {error?.type === "device-blocked" && (
            <div className="auth-error">
              <span>🚫</span> This device has been blocked. Contact Coach Bahaa if you think this is a mistake.
            </div>
          )}

          {/* Generic error */}
          {error?.type === "generic" && (
            <div className="auth-error">
              <span>⚠️</span> {error.message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="field-group">
              <label>Email address</label>
              <div className="input-wrap">
                <span className="input-icon">✉️</span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="field-group">
              <label>Password</label>
              <div className="input-wrap">
                <span className="input-icon">🔒</span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="field-row">
              <Link to="/forgot-password">Forgot password?</Link>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="helper-text">
            ℹ️ Your coach will activate your account after signup
          </div>
        </div>

      </div>
    </div>
  );
}