import { useAuth } from "../context/AuthContext";
import "../styles/dashboard.css";

const schedule = [
  { day: "MON", num: "30", name: "Upper Body + Cardio", time: "7:00 AM · 60 min", tag: "strength", active: true },
  { day: "WED", num: "02", name: "Lower Body Power",    time: "7:00 AM · 50 min", tag: "strength", active: false },
  { day: "FRI", num: "04", name: "HIIT Cardio",         time: "8:00 AM · 45 min", tag: "cardio",   active: false },
  { day: "SAT", num: "05", name: "Active Recovery",     time: "Anytime · 30 min", tag: "rest",     active: false },
];

export default function UserPage() {
  const { userData, logout } = useAuth();
  const isInactive = userData?.status !== "active";

  return (
    <div className="dash-layout">

      {/* ── SIDEBAR ── */}
      <aside className="dash-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">🏋️</div>
          <div className="sidebar-brand-name">GymCoach</div>
        </div>

        <span className="sidebar-section-label">Main</span>
        <nav className="sidebar-nav">
          <button className="nav-item active">
            <span className="nav-icon">⊞</span> Dashboard
          </button>
          <button className="nav-item">
            <span className="nav-icon">📅</span> My Sessions
          </button>
          <button className="nav-item">
            <span className="nav-icon">🥗</span> Nutrition
          </button>
          <button className="nav-item">
            <span className="nav-icon">📈</span> Progress
          </button>
          <button className="nav-item">
            <span className="nav-icon">🤖</span> AI Coach
            <span className="nav-badge">NEW</span>
          </button>
        </nav>

        <span className="sidebar-section-label">Account</span>
        <nav className="sidebar-nav">
          <button className="nav-item">
            <span className="nav-icon">⚙️</span> Settings
          </button>
          <button className="nav-item" onClick={logout}>
            <span className="nav-icon">🚪</span> Sign Out
          </button>
        </nav>

        <div className="sidebar-spacer" />

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {userData?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{userData?.name || "User"}</div>
              <div className="sidebar-user-role">
                {isInactive ? "⚠️ Inactive" : "✅ Active Client"}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="dash-main">

        {/* ── INACTIVE BANNER ── */}
        {isInactive && (
  <div className="inactive-banner">
    <div className="ib-left">
      <div className="ib-icon">🔒</div>
      <div className="ib-text">
        <div className="ib-title">
          Your subscription is inactive &nbsp;·&nbsp; اشتراكك غير فعّال
        </div>
        <div className="ib-sub">
          Contact Coach Bahaa to activate or renew your plan.&nbsp;
          <span className="ib-sub-ar">تواصل مع الكوتش بهاء لتفعيل أو تجديد خطتك.</span>
        </div>
      </div>
    </div>

    <a
      href="https://wa.me/201234567890"
      target="_blank"
      rel="noreferrer"
      className="ib-cta"
    >
      Contact Coach →
    </a>
  </div>
)}
        {/* Topbar */}
        <div className="dash-topbar">
          <div className="topbar-left">
            <div className="topbar-title">
              Good morning, {userData?.name?.split(" ")[0] || "there"} 👋
            </div>
            <div className="topbar-sub">Monday, June 30 · Week 4 of your plan</div>
          </div>
          <div className="topbar-actions">
            <button className="topbar-icon-btn" title="Notifications">🔔</button>
            <button className="topbar-btn primary">🤖 Ask AI Coach</button>
          </div>
        </div>

        {/* Content */}
        <div className={isInactive ? "dash-content blurred" : "dash-content"}>

          {/* Hero */}
          <div className="hero-card">
            <div style={{ flex: 1 }}>
              <div className="hero-eyebrow">
                <div className="pulse-dot" />
                <span className="eyebrow-label">Today's Session</span>
              </div>
              <div className="hero-title">Upper Body + Cardio</div>
              <div className="hero-meta">
                <div className="hero-meta-item">⏱ <b>60 min</b></div>
                <div className="hero-meta-item">🕖 <b>7:00 AM</b></div>
                <div className="hero-meta-item">🔥 <b>~420 kcal</b></div>
              </div>
              <div className="hero-actions">
                <button className="btn-primary" disabled={isInactive}>▶ Start Session</button>
                <button className="btn-outline">View Details</button>
              </div>
            </div>
            <div className="hero-visual">💪</div>
          </div>

          {/* Stats */}
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-top">
                <div className="stat-icon teal">🔥</div>
                <span className="stat-badge up">+12%</span>
              </div>
              <div className="stat-num">2,840</div>
              <div className="stat-label">Calories burned this week</div>
            </div>
            <div className="stat-card">
              <div className="stat-top">
                <div className="stat-icon blue">✅</div>
                <span className="stat-badge up">+1</span>
              </div>
              <div className="stat-num">11</div>
              <div className="stat-label">Sessions completed</div>
            </div>
            <div className="stat-card">
              <div className="stat-top">
                <div className="stat-icon amber">⚡</div>
                <span className="stat-badge up">−2 kg</span>
              </div>
              <div className="stat-num">84 kg</div>
              <div className="stat-label">Current weight</div>
            </div>
            <div className="stat-card">
              <div className="stat-top">
                <div className="stat-icon purple">🏆</div>
                <span className="stat-badge neu">Wk 4</span>
              </div>
              <div className="stat-num">28</div>
              <div className="stat-label">Day streak</div>
            </div>
          </div>

          {/* Schedule + Side */}
          <div className="grid-6040">
            <div className="dash-card">
              <div className="card-header">
                <div className="card-title">📅 Weekly Schedule</div>
                <a className="card-link">View all</a>
              </div>
              <div className="schedule-list">
                {schedule.map((s, i) => (
                  <div key={i} className={`schedule-row${s.active ? " active-day" : ""}`}>
                    <div className="sched-date">
                      <div className="d-name">{s.day}</div>
                      <div className="d-num">{s.num}</div>
                    </div>
                    <div className="sched-divider" />
                    <div className="sched-info">
                      <div className="sched-name">{s.name}</div>
                      <div className="sched-time">{s.time}</div>
                    </div>
                    <span className={`sched-tag ${s.tag}`}>
                      {s.tag.charAt(0).toUpperCase() + s.tag.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="dash-card">
                <div className="card-header">
                  <div className="card-title">🥗 Today's Nutrition</div>
                  <a className="card-link">Log meal</a>
                </div>
                <div className="prog-row">
                  <div className="prog-labels"><span>Calories</span><span>1,840 / 2,400</span></div>
                  <div className="prog-bg"><div className="prog-fill" style={{ width: "77%" }} /></div>
                </div>
                <div className="prog-row">
                  <div className="prog-labels"><span>Protein</span><span>142g / 180g</span></div>
                  <div className="prog-bg"><div className="prog-fill blue" style={{ width: "79%" }} /></div>
                </div>
                <div className="prog-row">
                  <div className="prog-labels"><span>Water</span><span>2.1L / 3L</span></div>
                  <div className="prog-bg"><div className="prog-fill amber" style={{ width: "70%" }} /></div>
                </div>
                <div className="macro-row">
                  <div className="macro-box"><div className="macro-val">142g</div><div className="macro-lbl">Protein</div></div>
                  <div className="macro-box"><div className="macro-val">210g</div><div className="macro-lbl">Carbs</div></div>
                  <div className="macro-box"><div className="macro-val">58g</div><div className="macro-lbl">Fats</div></div>
                </div>
              </div>

              <div className="ai-coach-card">
                <div className="ai-icon">🤖</div>
                <div className="ai-title">Ask Coach AI</div>
                <div className="ai-sub">Instant answers about your plan, meals, or workout form.</div>
                <button className="btn-primary" style={{ width: "100%" }} disabled={isInactive}>
                  Open Chat
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}