import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/config";
import AuthVisual from "../components/AuthVisual";
import "../styles/auth.css";

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

      // 1. Login
      const result = await login(email, password);
      const firebaseUser = result.user;

      // 2. Refresh token عشان emailVerified يتحدث
      await firebaseUser.reload();

      // 3. Check email verified
      if (!firebaseUser.emailVerified) {
        await logout();
        setError({ type: "verify" });
        setLoading(false);
        return;
      }

      // 4. Get role from Firestore
      const snap = await getDoc(doc(db, "users", firebaseUser.uid));

      if (!snap.exists()) {
        await logout();
        setError({
          type: "generic",
          message: "Account not found. Please sign up again.",
        });
        setLoading(false);
        return;
      }

      const userData = snap.data();

      // 5. Route by role — status check هيتعمل جوه الصفحة نفسها
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
    <div className="auth-page">
      <AuthVisual />

      <div className="auth-form-panel">
        <div className="auth-form-box">

          <div className="form-brand">
            <div className="form-brand-icon">🏋️</div>
            <div className="form-brand-name">GymCoach</div>
          </div>

          <h2>Welcome back</h2>
          <p className="sub">
            Back to your fitness journey.{" "}
            <Link to="/signup">New here? Sign up</Link>
          </p>

          {/* ── NOT VERIFIED ── */}
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

          {/* ── GENERIC ERROR ── */}
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

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="helper-text">
            <span className="ht-icon">ℹ️</span>
            Your coach will activate your account after signup
          </div>

        </div>
      </div>
    </div>
  );
}