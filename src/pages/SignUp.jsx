import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/auth.css";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    console.log({ name, email, password, confirmPassword });
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
            <h1>Your <span className="accent-text">transformation</span> starts here</h1>
            <p>Sign up and Bahaa will personally build your plan, schedule your sessions, and activate your account.</p>
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

          <h2>Create your account</h2>
          <p className="sub">Start your fitness journey today. <Link to="/login">Already have one? Sign in</Link></p>

          <form onSubmit={handleSubmit}>
            <div className="field-group">
              <label>Full name</label>
              <div className="input-wrap">
                <span className="input-icon">👤</span>
                <input type="text" placeholder="John Smith" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
            </div>

            <div className="field-group">
              <label>Email address</label>
              <div className="input-wrap">
                <span className="input-icon">✉️</span>
                <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>

            <div className="field-group">
              <label>Password</label>
              <div className="input-wrap">
                <span className="input-icon">🔒</span>
                <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            </div>

            <div className="field-group">
              <label>Confirm password</label>
              <div className="input-wrap">
                <span className="input-icon">🔒</span>
                <input type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" style={{ marginTop: "4px" }}>Create Account</button>
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