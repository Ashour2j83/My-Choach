import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/auth.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    console.log({ email });
    setSent(true);
  }

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="visual-inner">

          <div className="coach-card">
            <div className="coach-avatar">🏋️</div>
            <div className="coach-meta">
              <div className="coach-name">Coach Bahaa</div>
              <div className="coach-title">Certified Nutrition & Fitness Coach</div>
            </div>
            <div className="coach-stats">
              <div className="coach-stat">
                <div className="num">250+</div>
                <div className="lbl">Active Clients</div>
              </div>
              <div className="coach-stat">
                <div className="num">8</div>
                <div className="lbl">Years Exp.</div>
              </div>
            </div>
          </div>

          <div className="visual-hero">
            <h1>Don't worry, <span className="accent-text">we got you</span></h1>
            <p>Reset your password and get straight back to your plan, your sessions, and your progress with Bahaa.</p>
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <div className="fc-icon">🥗</div>
              <div className="fc-title">Nutrition Plan</div>
              <div className="fc-sub">Meal tracking</div>
            </div>
            <div className="feature-card">
              <div className="fc-icon">📅</div>
              <div className="fc-title">Weekly Sessions</div>
              <div className="fc-sub">Schedule overview</div>
            </div>
            <div className="feature-card">
              <div className="fc-icon">🤖</div>
              <div className="fc-title">AI Coach</div>
              <div className="fc-sub">Chat assistant</div>
            </div>
          </div>

          <div className="session-preview">
            <div className="sp-dot"></div>
            <div className="sp-text">
              <b>Next Session:</b> Upper Body + Cardio
            </div>
            <div className="sp-time">Tomorrow 7:00 AM</div>
          </div>

        </div>
      </div>

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
                No worries, enter your email and we'll send you a reset link.{" "}
                <Link to="/login">Back to sign in</Link>
              </p>

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
                    />
                  </div>
                </div>

                <button type="submit" className="auth-submit-btn">
                  Send Reset Link
                </button>
              </form>

              <div className="helper-text">
                <span className="ht-icon">ℹ️</span>
                The reset link will expire in 15 minutes
              </div>
            </>
          ) : (
            <>
              <h2>Check your inbox</h2>
              <p className="sub">
                We've sent a password reset link to <b>{email}</b>. Didn't get it?{" "}
                <a href="#" onClick={(e) => { e.preventDefault(); handleSubmit(e); }}>Resend</a>
              </p>

              <Link to="/login" className="auth-submit-btn" style={{ display: "block", textAlign: "center", textDecoration: "none" }}>
                Back to Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}