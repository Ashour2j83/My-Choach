import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthVisual from "../components/AuthVisual";
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

    // ── Validations ──
    if (name.trim().length < 2) {
      return setError("Please enter your full name.");
    }

    if (password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }

    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    try {
      setLoading(true);
      await signup(name.trim(), email, password);
      navigate("/verify-email"); // بعد الـ signup يروح لصفحة التحقق
    } catch (err) {
      // Firebase error codes → رسائل واضحة
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
    <div className="auth-page">
      <AuthVisual />

      <div className="auth-form-panel">
        <div className="auth-form-box">
          <div className="form-brand">
            <div className="form-brand-icon">🏋️</div>
            <div className="form-brand-name">GymCoach</div>
          </div>

          <h2>Create your account</h2>
          <p className="sub">
            Start your fitness journey today.{" "}
            <Link to="/login">Already have one? Sign in</Link>
          </p>

          {/* Error message */}
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
            <span className="ht-icon">ℹ️</span>
            Your coach will activate your account after signup
          </div>
        </div>
      </div>
    </div>
  );
}