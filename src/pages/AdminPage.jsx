import { useEffect, useMemo, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore";

import { db } from "../firebase/config.js";
import UserEditorModal from "../components/Usereditormodal";
import PlanEditorModal from "../components/Planeditormodal";
import AddClientModal from "../components/Addclientmodal";
import WeightHistoryModal from "../components/WieghtHistoryModal.jsx";
import "../styles/dashboard.css";

const NAV_ITEMS = [
  { key: "overview", icon: "⊞", label: "Overview" },
  { key: "clients", icon: "👥", label: "Clients" },
  { key: "plans", icon: "🥗", label: "Nutrition Plans" },
  { key: "weight", icon: "⚖️", label: "Weight History" },
  { key: "requests", icon: "🔔", label: "Requests" },
];

function fmtDate(ts) {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function initialsOf(name = "") {
  return name.trim().charAt(0).toUpperCase() || "?";
}

const AV_CLASSES = ["", "b", "c", "d"];

export default function AdminDashboard() {
  const [activeView, setActiveView] = useState("overview");

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState("");

  const [planIds, setPlanIds] = useState(new Set());

  const [editingUser, setEditingUser] = useState(null); // profile modal
  const [planUser, setPlanUser] = useState(null); // nutrition plan modal
  const [weightUser, setWeightUser] = useState(null); // weight history modal
  const [showAddClient, setShowAddClient] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [search, setSearch] = useState("");

  function goTo(viewKey) {
    setActiveView(viewKey);
    setMobileNavOpen(false);
  }

  // Real-time listener on "users"
  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setUsersLoading(false);
      },
      (err) => {
        console.error(err);
        setUsersError("Couldn't load clients from Firestore.");
        setUsersLoading(false);
      }
    );
    return () => unsub();
  }, []);

  // Real-time listener on "plans" — only need which doc IDs exist,
  // to flag which clients already have a nutrition plan.
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "plans"), (snap) => {
      setPlanIds(new Set(snap.docs.map((d) => d.id)));
    });
    return () => unsub();
  }, []);

  const stats = useMemo(() => {
    const active = users.filter((u) => u.status === "active").length;
    const pending = users.filter((u) => u.status === "pending").length;
    const totalSessions = users.reduce(
      (sum, u) => sum + (Number(u.remainingSessions) || 0),
      0
    );
    const completion =
      users.length === 0
        ? 0
        : Math.round((planIds.size / users.length) * 100);
    return { active, pending, totalSessions, completion };
  }, [users, planIds]);

  const pendingUsers = useMemo(
    () => users.filter((u) => u.status === "pending"),
    [users]
  );

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const s = search.toLowerCase();
    return users.filter(
      (u) =>
        (u.name || "").toLowerCase().includes(s) ||
        (u.email || "").toLowerCase().includes(s)
    );
  }, [users, search]);

  async function setStatus(userId, status) {
    try {
      await updateDoc(doc(db, "users", userId), { status });
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="dash-layout">
      {/* Mobile drawer backdrop */}
      {mobileNavOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`dash-sidebar ${mobileNavOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">🏋️</div>
          <div className="sidebar-brand-name">GymCoach</div>
          <button
            className="sidebar-mobile-close"
            onClick={() => setMobileNavOpen(false)}
          >
            ✕
          </button>
        </div>

        <span className="sidebar-section-label">Coach Panel</span>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              className={`nav-item ${activeView === item.key ? "active" : ""}`}
              onClick={() => goTo(item.key)}
            >
              <span className="nav-icon">{item.icon}</span> {item.label}
            </button>
          ))}
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
        <div className="dash-topbar">
          <div className="topbar-left">
            <button
              className="topbar-menu-btn"
              onClick={() => setMobileNavOpen(true)}
              title="Menu"
            >
              ☰
            </button>
            <div className="topbar-left-text">
              <div className="topbar-title">
                {NAV_ITEMS.find((n) => n.key === activeView)?.label ?? "Overview"}
              </div>
              <div className="topbar-sub">
                {users.length} client{users.length === 1 ? "" : "s"} · live from Firestore
              </div>
            </div>
          </div>
          <div className="topbar-actions">
            <button
              className="topbar-icon-btn"
              title="Home"
              onClick={() => (window.location.href = "/")}
            >
              🏠
            </button>
            <button className="topbar-btn" onClick={() => setShowAddClient(true)}>
              + <span className="btn-text-full">Add Client</span>
            </button>
          </div>
        </div>

        <div className="dash-content">
          {usersError && <div className="empty-state">{usersError}</div>}

          {activeView === "overview" && (
            <Overview
              stats={stats}
              users={filteredUsers}
              usersLoading={usersLoading}
              pendingUsers={pendingUsers}
              planIds={planIds}
              onOpenUser={setEditingUser}
              onOpenPlan={setPlanUser}
              onOpenWeight={setWeightUser}
              onApprove={(id) => setStatus(id, "active")}
              onReject={(id) => setStatus(id, "inactive")}
            />
          )}

          {activeView === "clients" && (
            <ClientsView
              users={filteredUsers}
              usersLoading={usersLoading}
              search={search}
              setSearch={setSearch}
              planIds={planIds}
              onOpenUser={setEditingUser}
              onOpenPlan={setPlanUser}
              onOpenWeight={setWeightUser}
            />
          )}

          {activeView === "plans" && (
            <PlansView
              users={users}
              usersLoading={usersLoading}
              planIds={planIds}
              onOpenPlan={setPlanUser}
            />
          )}

          {activeView === "weight" && (
            <WeightPickerView
              users={users}
              usersLoading={usersLoading}
              onOpenWeight={setWeightUser}
            />
          )}
        </div>
      </div>

      {editingUser && (
        <UserEditorModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
        />
      )}
      {planUser && (
        <PlanEditorModal user={planUser} onClose={() => setPlanUser(null)} />
      )}
      {weightUser && (
        <WeightHistoryModal user={weightUser} onClose={() => setWeightUser(null)} />
      )}
      {showAddClient && (
        <AddClientModal onClose={() => setShowAddClient(false)} />
      )}
    </div>
  );
}

/* ============================================================
   OVERVIEW
   ============================================================ */
function Overview({
  stats,
  users,
  usersLoading,
  pendingUsers,
  planIds,
  onOpenUser,
  onOpenPlan,
  onOpenWeight,
  onApprove,
  onReject,
}) {
  return (
    <>
      <div className="stats-row">
        <StatCard icon="👥" cls="teal" badge={`${stats.active} active`} badgeType="up" num={stats.active} label="Active clients" />
        <StatCard icon="⏱️" cls="blue" badge="Total" badgeType="neu" num={stats.totalSessions} label="Remaining sessions" />
        <StatCard icon="⏳" cls="amber" badge={stats.pending > 0 ? "Action needed" : "All clear"} badgeType={stats.pending > 0 ? "down" : "up"} num={stats.pending} label="Pending approvals" />
        <StatCard icon="🥗" cls="purple" badge="Coverage" badgeType="neu" num={`${stats.completion}%`} label="Clients with a plan" />
      </div>

      {pendingUsers.length > 0 && (
        <div className="dash-card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <div className="card-title">⏳ Pending Approvals</div>
          </div>
          <div className="pending-list">
            {pendingUsers.map((p) => (
              <div key={p.id} className="pending-item">
                <div className="pending-av">👤</div>
                <div className="pending-info">
                  <div className="pending-name">{p.name || "Unnamed client"}</div>
                  <div className="pending-meta">{p.email} · {p.goal || "No goal set"}</div>
                </div>
                <div className="pending-btns">
                  <button className="btn-approve" onClick={() => onApprove(p.id)}>✓ Approve</button>
                  <button className="btn-reject" onClick={() => onReject(p.id)}>✕ Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="dash-card">
        <div className="card-header">
          <div className="card-title">👥 Recent Clients</div>
        </div>
        <ClientsTable
          users={users.slice(0, 6)}
          loading={usersLoading}
          planIds={planIds}
          onOpenUser={onOpenUser}
          onOpenPlan={onOpenPlan}
          onOpenWeight={onOpenWeight}
        />
      </div>
    </>
  );
}

function StatCard({ icon, cls, badge, badgeType, num, label }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <div className={`stat-icon ${cls}`}>{icon}</div>
        <span className={`stat-badge ${badgeType}`}>{badge}</span>
      </div>
      <div className="stat-num">{num}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

/* ============================================================
   CLIENTS
   ============================================================ */
function ClientsView({ users, usersLoading, search, setSearch, planIds, onOpenUser, onOpenPlan, onOpenWeight }) {
  return (
    <div className="dash-card">
      <div className="card-header">
        <div className="card-title">👥 All Clients</div>
        <input
          className="field-input"
          style={{ width: 220 }}
          placeholder="Search name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <ClientsTable
        users={users}
        loading={usersLoading}
        planIds={planIds}
        onOpenUser={onOpenUser}
        onOpenPlan={onOpenPlan}
        onOpenWeight={onOpenWeight}
      />
    </div>
  );
}

function ClientsTable({ users, loading, planIds, onOpenUser, onOpenPlan, onOpenWeight }) {
  if (loading) return <div className="loading-row">Loading clients…</div>;
  if (users.length === 0)
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🗂️</div>
        No clients yet. Add one with "+ Add Client".
      </div>
    );

  return (
    <div className="table-scroll">
      <table className="clients-table">
        <thead>
          <tr>
            <th>Client</th>
            <th>Status</th>
            <th>Sessions left</th>
            <th>Joined</th>
            <th>Plan</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, i) => (
            <tr key={u.id} onClick={() => onOpenUser(u)}>
              <td>
                <div className="client-cell">
                  <div className={`client-av ${AV_CLASSES[i % AV_CLASSES.length]}`}>
                    {initialsOf(u.name)}
                  </div>
                  <div>
                    <div className="client-name">{u.name || "Unnamed"}</div>
                    <div className="client-email">{u.email}</div>
                  </div>
                </div>
              </td>
              <td>
                <span className={`status-chip ${u.status || "active"}`}>
                  {(u.status || "active").charAt(0).toUpperCase() + (u.status || "active").slice(1)}
                </span>
              </td>
              <td style={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                {u.remainingSessions ?? 0}
              </td>
              <td style={{ color: "var(--muted)", fontSize: 12 }}>{fmtDate(u.createdAt)}</td>
              <td>
                <span className={`plan-doc-flag ${planIds.has(u.id) ? "exists" : "missing"}`}>
                  {planIds.has(u.id) ? "Has plan" : "No plan"}
                </span>
              </td>
              <td>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    className="btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenPlan(u);
                    }}
                  >
                    Plan
                  </button>
                  <button
                    className="btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenWeight(u);
                    }}
                  >
                    Weight
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ============================================================
   NUTRITION PLANS
   ============================================================ */
function PlansView({ users, usersLoading, planIds, onOpenPlan }) {
  if (usersLoading) return <div className="dash-card"><div className="loading-row">Loading clients…</div></div>;

  return (
    <div className="dash-card">
      <div className="card-header">
        <div className="card-title">🥗 Select a client to view or edit their plan</div>
      </div>
      {users.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🥗</div>
          No clients yet.
        </div>
      ) : (
        <div className="plan-picker-list">
          {users.map((u) => (
            <div
              key={u.id}
              className="plan-picker-item"
              onClick={() => onOpenPlan(u)}
              style={{ cursor: "pointer" }}
            >
              <div className="client-av">{initialsOf(u.name)}</div>
              <div>
                <div className="client-name">{u.name || "Unnamed"}</div>
                <div className="client-email">{u.email}</div>
              </div>
              <span className={`plan-doc-flag ${planIds.has(u.id) ? "exists" : "missing"}`}>
                {planIds.has(u.id) ? "Plan exists" : "No plan yet"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   WEIGHT HISTORY (picker)
   ============================================================ */
function WeightPickerView({ users, usersLoading, onOpenWeight }) {
  if (usersLoading) return <div className="dash-card"><div className="loading-row">Loading clients…</div></div>;

  return (
    <div className="dash-card">
      <div className="card-header">
        <div className="card-title">⚖️ Select a client to view their weight history</div>
      </div>
      {users.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">⚖️</div>
          No clients yet.
        </div>
      ) : (
        <div className="plan-picker-list">
          {users.map((u) => (
            <div
              key={u.id}
              className="plan-picker-item"
              onClick={() => onOpenWeight(u)}
              style={{ cursor: "pointer" }}
            >
              <div className="client-av">{initialsOf(u.name)}</div>
              <div>
                <div className="client-name">{u.name || "Unnamed"}</div>
                <div className="client-email">{u.email}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}