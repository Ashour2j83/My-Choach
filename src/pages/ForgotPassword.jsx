import { useState } from "react";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/config";
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
              Don't worry, <span className="accent">we got you</span>
            </div>
            <div className="ct-desc">
              Reset your password and get straight back to your plan and sessions.
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
          {!sent ? (
            <>
              <div className="cf-title">Forgot your password?</div>
              <div className="cf-sub">
                Enter your email and we'll send a reset link.{" "}
                <Link to="/login">Back to sign in</Link>
              </div>

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

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>

              <div className="helper-text">
                ℹ️ The reset link expires in 15 minutes
              </div>
            </>
          ) : (
            <>
              <div className="cf-title">Check your inbox 📬</div>
              <div className="cf-sub">
                We sent a reset link to{" "}
                <b style={{ color: "#f0ebe6" }}>{email}</b>.
              </div>

              <div className="auth-notice verify" style={{ marginTop: "8px" }}>
                <div className="notice-icon">✉️</div>
                <div className="notice-body">
                  <div className="notice-title">Reset link sent!</div>
                  <div className="notice-sub">
                    Open the email from Firebase and follow the link to set a new password.
                    The link expires in <b>15 minutes</b>.
                  </div>
                  <button className="notice-resend" onClick={() => setSent(false)}>
                    Wrong email? Try again →
                  </button>
                </div>
              </div>

              <Link
                to="/login"
                className="auth-submit-btn"
                style={{ display: "block", textAlign: "center", textDecoration: "none", marginTop: "16px" }}
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