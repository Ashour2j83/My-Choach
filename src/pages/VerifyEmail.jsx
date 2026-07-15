import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";

export default function VerifyEmail() {
  const { user, resendVerification } = useAuth();

  const [sent,     setSent]     = useState(false);
  const [sending,  setSending]  = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error,    setError]    = useState("");

  async function handleResend() {
    if (sending || cooldown > 0) return;
    setError("");
    try {
      setSending(true);
      await resendVerification();
      setSent(true);
      setCooldown(30);
      const timer = setInterval(() => {
        setCooldown((c) => {
          if (c <= 1) {
            clearInterval(timer);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    } catch (err) {
      console.error(err);
      setError("Couldn't resend right now. Please try again in a moment.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="card-form" style={{ textAlign: "center", paddingTop: 40 }}>
          <div style={{ fontSize: 52, marginBottom: 18, lineHeight: 1 }}>📩</div>

          <div className="cf-title">Check your inbox</div>
          <div className="cf-sub" style={{ marginBottom: 0 }}>
            We've sent a verification link to{" "}
            {user?.email ? (
              <b style={{ color: "#f0ebe6" }}>{user.email}</b>
            ) : (
              "your email"
            )}
            . Open it to activate your account.
          </div>

          <div className="auth-notice verify" style={{ marginTop: 20, textAlign: "left" }}>
            <div className="notice-icon">📂</div>
            <div className="notice-body">
              <div className="notice-title">Can't find it?</div>
              <div className="notice-sub">
                Double-check the address above is correct, then take a look in your{" "}
                <b>Spam</b> or <b>Junk</b> folder — verification emails sometimes land
                there by mistake.
              </div>
              {sent ? (
                <div className="notice-sent">✅ New email sent! Check your inbox.</div>
              ) : (
                <button
                  className="notice-resend"
                  onClick={handleResend}
                  disabled={sending || cooldown > 0}
                >
                  {sending
                    ? "Sending…"
                    : cooldown > 0
                    ? `You can resend in ${cooldown}s`
                    : "Didn't receive it? Resend →"}
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="auth-error" style={{ marginTop: 16, textAlign: "left" }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <div className="helper-text" style={{ marginTop: 26 }}>
            <Link to="/login">← Return to login page</Link>
          </div>
        </div>
      </div>
    </div>
  );
}