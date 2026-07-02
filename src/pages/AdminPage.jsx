import "../styles/dashboard.css";

const clients = [
  { initials: "A",  cls: "",  name: "Ahmed Ali",    email: "ahmed@mail.com",   plan: "Weight Loss",    status: "active",  sessions: 11, joined: "Jun 1" },
  { initials: "M",  cls: "b", name: "Mohamed Tarek",email: "m.tarek@mail.com", plan: "Muscle Gain",    status: "active",  sessions: 8,  joined: "Jun 8" },
  { initials: "S",  cls: "c", name: "Sara Hassan",  email: "sara@mail.com",    plan: "Body Recomp",    status: "paused",  sessions: 3,  joined: "May 20" },
  { initials: "Y",  cls: "d", name: "Youssef Khaled",email: "y.k@mail.com",   plan: "Endurance",      status: "active",  sessions: 15, joined: "May 5" },
];

const pending = [
  { emoji: "👤", name: "Nour Mahmoud",   meta: "Signed up 2 hours ago · Weight Loss plan" },
  { emoji: "👤", name: "Omar Fathy",     meta: "Signed up 5 hours ago · Muscle Gain plan" },
];

const todaySchedule = [
  { time: "7:00 AM",  name: "Upper Body + Cardio", client: "Ahmed Ali",     dot: "done" },
  { time: "9:00 AM",  name: "Lower Body Power",    client: "Youssef Khaled",dot: "done" },
  { time: "11:00 AM", name: "HIIT Cardio",          client: "Mohamed Tarek", dot: "upcoming" },
  { time: "5:00 PM",  name: "Body Recomp",          client: "New client",    dot: "upcoming" },
];

export default function AdminPage() {
  return (
    <div className="dash-layout">

      {/* ── SIDEBAR ── */}
      <aside className="dash-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">🏋️</div>
          <div className="sidebar-brand-name">GymCoach</div>
        </div>

        <span className="sidebar-section-label">Coach Panel</span>
        <nav className="sidebar-nav">
          <button className="nav-item active">
            <span className="nav-icon">⊞</span> Overview
          </button>
          <button className="nav-item">
            <span className="nav-icon">👥</span> Clients
          </button>
          <button className="nav-item">
            <span className="nav-icon">📅</span> Schedule
          </button>
          <button className="nav-item">
            <span className="nav-icon">🥗</span> Nutrition Plans
          </button>
          <button className="nav-item">
            <span className="nav-icon">📊</span> Analytics
          </button>
          <button className="nav-item">
            <span className="nav-icon">🔔</span> Requests
            <span className="nav-badge amber">2</span>
          </button>
        </nav>

        <span className="sidebar-section-label">Account</span>
        <nav className="sidebar-nav">
          <button className="nav-item">
            <span className="nav-icon">⚙️</span> Settings
          </button>
        </nav>

        <div className="sidebar-spacer" />

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="sidebar-avatar">B</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">Coach Bahaa</div>
              <div className="sidebar-user-role">Admin</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="dash-main">

        {/* Topbar */}
        <div className="dash-topbar">
          <div className="topbar-left">
            <div className="topbar-title">Coach Dashboard</div>
            <div className="topbar-sub">Monday, June 30 · 4 sessions today</div>
          </div>
          <div className="topbar-actions">
            <button className="topbar-icon-btn" title="Notifications">🔔</button>
            <button className="topbar-btn">+ Add Client</button>
            <button className="topbar-btn primary">+ New Session</button>
          </div>
        </div>

        {/* Content */}
        <div className="dash-content">

          {/* Stats */}
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-top">
                <div className="stat-icon teal">👥</div>
                <span className="stat-badge up">+3</span>
              </div>
              <div className="stat-num">24</div>
              <div className="stat-label">Active clients</div>
            </div>
            <div className="stat-card">
              <div className="stat-top">
                <div className="stat-icon blue">📅</div>
                <span className="stat-badge neu">Today</span>
              </div>
              <div className="stat-num">4</div>
              <div className="stat-label">Sessions scheduled</div>
            </div>
            <div className="stat-card">
              <div className="stat-top">
                <div className="stat-icon amber">⏳</div>
                <span className="stat-badge down">Action needed</span>
              </div>
              <div className="stat-num">2</div>
              <div className="stat-label">Pending approvals</div>
            </div>
            <div className="stat-card">
              <div className="stat-top">
                <div className="stat-icon purple">✅</div>
                <span className="stat-badge up">+8%</span>
              </div>
              <div className="stat-num">87%</div>
              <div className="stat-label">Client completion rate</div>
            </div>
          </div>

          {/* Pending Approvals */}
          {pending.length > 0 && (
            <div className="dash-card" style={{ marginBottom: "20px" }}>
              <div className="card-header">
                <div className="card-title">⏳ Pending Approvals</div>
                <a className="card-link">View all</a>
              </div>
              <div className="pending-list">
                {pending.map((p, i) => (
                  <div key={i} className="pending-item">
                    <div className="pending-av">{p.emoji}</div>
                    <div className="pending-info">
                      <div className="pending-name">{p.name}</div>
                      <div className="pending-meta">{p.meta}</div>
                    </div>
                    <div className="pending-btns">
                      <button className="btn-approve">✓ Approve</button>
                      <button className="btn-reject">✕ Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clients Table + Today's Schedule */}
          <div className="grid-6040">

            {/* Clients Table */}
            <div className="dash-card">
              <div className="card-header">
                <div className="card-title">👥 All Clients</div>
                <a className="card-link">Manage</a>
              </div>
              <table className="clients-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Plan</th>
                    <th>Status</th>
                    <th>Sessions</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((c, i) => (
                    <tr key={i}>
                      <td>
                        <div className="client-cell">
                          <div className={`client-av ${c.cls}`}>{c.initials}</div>
                          <div>
                            <div className="client-name">{c.name}</div>
                            <div className="client-email">{c.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: "var(--muted)", fontSize: "12px" }}>{c.plan}</td>
                      <td><span className={`status-chip ${c.status}`}>{c.status.charAt(0).toUpperCase() + c.status.slice(1)}</span></td>
                      <td style={{ fontWeight: 700 }}>{c.sessions}</td>
                      <td><button className="btn-sm">View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Today's Schedule */}
            <div className="dash-card">
              <div className="card-header">
                <div className="card-title">📅 Today's Schedule</div>
                <a className="card-link">Full view</a>
              </div>
              <div className="mini-sched">
                {todaySchedule.map((s, i) => (
                  <div key={i} className="mini-sched-item">
                    <div className="mini-time">{s.time}</div>
                    <div className="mini-info">
                      <div className="mini-name">{s.name}</div>
                      <div className="mini-client">{s.client}</div>
                    </div>
                    <div className={`mini-dot ${s.dot}`} />
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}