import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    console.log({ email, password });
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
            <p>Everything Bahaa built for you — meals, sessions, and progress — waiting on the other side of this login.</p>
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

          <h2>Welcome back</h2>
          <p className="sub">Welcome back to your fitness journey. <Link to="/signup">New here? Sign up</Link></p>

          <form onSubmit={handleSubmit}>
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

            <div className="field-row">
              <label className="checkbox-row"><input type="checkbox" />Remember me</label>
              <a href="/forgot-password">Forgot password?</a>
            </div>

            <button type="submit" className="auth-submit-btn">Sign In</button>
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