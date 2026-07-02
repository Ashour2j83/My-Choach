import { useState } from "react";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/config";
import AuthVisual from "../components/AuthVisual";
import "../styles/auth.css";

export default function ForgotPassword() {
  const [email,   setEmail]   = useState("");
  const [sent,    setSent]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err) {
      switch (err.code) {
        case "auth/user-not-found":
          setError("No account found with this email.");
          break;
        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;
        case "auth/too-many-requests":
          setError("Too many attempts. Please wait a few minutes.");
          break;
        default:
          setError("Something went wrong. Please try again.");
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

          {!sent ? (
            <>
              <h2>Forgot your password?</h2>
              <p className="sub">
                Enter your email and we'll send you a reset link.{" "}
                <Link to="/login">Back to sign in</Link>
              </p>

              {error && (
                <div className="auth-error">
                  <span>⚠️</span> {error}
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

                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>

              <div className="helper-text">
                <span className="ht-icon">ℹ️</span>
                The reset link expires in 15 minutes
              </div>
            </>
          ) : (
            <>
              <h2>Check your inbox 📬</h2>
              <p className="sub">
                We sent a reset link to{" "}
                <b style={{ color: "#f5f0ec" }}>{email}</b>.
              </p>

              <div className="auth-notice verify" style={{ marginTop: "8px" }}>
                <div className="notice-icon">✉️</div>
                <div className="notice-body">
                  <div className="notice-title">Reset link sent!</div>
                  <div className="notice-sub">
                    Open the email from Firebase and follow the link to set a new password.
                    The link expires in <b>15 minutes</b>.
                  </div>
                  <button
                    className="notice-resend"
                    onClick={() => setSent(false)}
                  >
                    Wrong email? Try again →
                  </button>
                </div>
              </div>

              <Link
                to="/login"
                className="auth-submit-btn"
                style={{
                  display: "block",
                  textAlign: "center",
                  textDecoration: "none",
                  marginTop: "16px",
                }}
              >
                Back to Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}