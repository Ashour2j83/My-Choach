import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";

export default function SignUp() {
  const { signup } = useAuth();
  const navigate   = useNavigate();

  const [name,            setName]            = useState("");
  const [email,           setEmail]           = useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error,           setError]           = useState("");
  const [loading,         setLoading]         = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (name.trim().length < 2) return setError("Please enter your full name.");
    if (password.length < 6)    return setError("Password must be at least 6 characters.");
    if (password !== confirmPassword) return setError("Passwords do not match.");

    try {
      setLoading(true);
      await signup(name.trim(), email, password);
      navigate("/verify-email");
    } catch (err) {
      switch (err.code) {
        case "auth/email-already-in-use":
          setError("An account with this email already exists.");
          break;
        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;
        case "auth/weak-password":
          setError("Password is too weak. Use at least 6 characters.");
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
              Your <span className="accent">transformation</span> starts here
            </div>
            <div className="ct-desc">
              Sign up and Bahaa will personally build your plan and activate your account.
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
          <div className="cf-title">Create your account</div>
          <div className="cf-sub">
            Start your fitness journey today.{" "}
            <Link to="/login">Already have one? Sign in</Link>
          </div>

          {error && (
            <div className="auth-error">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="field-group">
              <label>Full name</label>
              <div className="input-wrap">
                <span className="input-icon">👤</span>
                <input
                  type="text"
                  placeholder="John Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

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
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="field-group">
              <label>Confirm password</label>
              <div className="input-wrap">
                <span className="input-icon">🔒</span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
              style={{ marginTop: "4px" }}
            >
              {loading ? "Creating account..." : "Create Account"}
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