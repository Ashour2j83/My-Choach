import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/config";
import "../styles/user.css";

/* ── ICONS ────────────────────────────────────────────────────── */
const Icon = {
  grid:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
  plan:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>,
  chart:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  logout:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  whatsapp:<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.557 4.118 1.529 5.845L.057 23.852l6.185-1.622A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.6a9.6 9.6 0 0 1-4.9-1.344l-.35-.208-3.632.953.97-3.54-.228-.364A9.6 9.6 0 1 1 12 21.6z"/></svg>,
  chevron: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>,
  scale:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v1M5.636 5.636l.707.707M3 12h1M5.636 18.364l.707-.707M12 21v-1M18.364 18.364l-.707-.707M21 12h-1M18.364 5.636l-.707.707"/><circle cx="12" cy="12" r="4"/></svg>,
  fire:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2c0 0-5 5-5 10a5 5 0 0 0 10 0c0-5-5-10-5-10zM9 16c0 0 1-2 3-2s3 2 3 2"/></svg>,
  target:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  ruler:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 6H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1z"/><path d="M7 6v4M11 6v2M15 6v4M19 6v2"/></svg>,
};

const MEAL_META = {
  breakfast: { label: "Breakfast", emoji: "🌅", color: "#ffb74d", bg: "rgba(255,183,77,0.1)" },
  snack1:    { label: "Snack 1",   emoji: "🍎", color: "#ff6b6b", bg: "rgba(255,107,107,0.1)" },
  lunch:     { label: "Lunch",     emoji: "☀️", color: "#ff6b35", bg: "rgba(255,107,53,0.1)" },
  snack2:    { label: "Snack 2",   emoji: "🥜", color: "#a0714f", bg: "rgba(160,113,79,0.1)" },
  dinner:    { label: "Dinner",    emoji: "🌙", color: "#b388ff", bg: "rgba(179,136,255,0.1)" },
};

const MEAL_ORDER = ["breakfast","snack1","lunch","snack2","dinner"];

/* ── SMOOTH BEZIER WEIGHT CHART ───────────────────────────────── */
function WeightChart({ entries }) {
  if (!entries || entries.length < 2) return null;

  const sorted = [...entries].sort((a,b) => new Date(a.date) - new Date(b.date));
  const weights = sorted.map(e => parseFloat(e.weight)).filter(Boolean);
  if (!weights.length) return null;

  const min = Math.min(...weights) - 1.5;
  const max = Math.max(...weights) + 1.5;
  const W = 340, H = 160;
  const PAD = { t: 20, r: 16, b: 28, l: 36 };
  const iW = W - PAD.l - PAD.r;
  const iH = H - PAD.t - PAD.b;

  const pts = sorted.map((e, i) => ({
    x: PAD.l + (sorted.length === 1 ? iW / 2 : (i / (sorted.length - 1)) * iW),
    y: PAD.t + (1 - (parseFloat(e.weight) - min) / (max - min)) * iH,
    weight: parseFloat(e.weight),
    date: e.date,
  }));

  // Smooth bezier
  let linePath = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const cpx = (curr.x - prev.x) * 0.42;
    linePath += ` C ${prev.x + cpx} ${prev.y} ${curr.x - cpx} ${curr.y} ${curr.x} ${curr.y}`;
  }

  const areaPath =
    linePath +
    ` L ${pts[pts.length - 1].x} ${H - PAD.b} L ${pts[0].x} ${H - PAD.b} Z`;

  const first = weights[0], last = weights[weights.length - 1];
  const diff = (last - first).toFixed(1);
  const isDown = diff < 0;
  const color = isDown ? "#00e676" : "#ff6b35";

  // Y-axis ticks
  const yTicks = [max, (max + min) / 2, min].map(v => ({
    y: PAD.t + (1 - (v - min) / (max - min)) * iH,
    label: Math.round(v),
  }));

  // X-axis labels (first, middle if exists, last)
  const xLabels = [pts[0]];
  if (pts.length > 3) xLabels.push(pts[Math.floor(pts.length / 2)]);
  xLabels.push(pts[pts.length - 1]);
  const xUnique = xLabels.filter((p, i, a) => a.findIndex(q => q.x === p.x) === i);

  return (
    <div className="wc-wrap">
      <div className="wc-header">
        <div>
          <div className="wc-title">Weight Progress</div>
          <div className="wc-dates">
            {sorted[0].date} → {sorted[sorted.length - 1].date}
          </div>
        </div>
        <div className={`wc-badge ${isDown ? "down" : "up"}`}>
          {isDown ? "▼" : "▲"} {Math.abs(diff)} kg
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="wc-svg" preserveAspectRatio="none">
        <defs>
          <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity="0.28"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
          <filter id="line-glow" x="-20%" y="-50%" width="140%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Grid lines + Y labels */}
        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={PAD.l} y1={t.y} x2={W - PAD.r} y2={t.y}
              stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 6"/>
            <text x={PAD.l - 6} y={t.y + 4} textAnchor="end"
              fill="rgba(255,255,255,0.22)" fontSize="9.5" fontFamily="Inter,sans-serif">
              {t.label}
            </text>
          </g>
        ))}

        {/* Area */}
        <path d={areaPath} fill="url(#wg)"/>

        {/* Smooth line */}
        <path d={linePath} fill="none" stroke={color} strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" filter="url(#line-glow)"/>

        {/* Dots */}
        {pts.map((p, i) => {
          const isLast = i === pts.length - 1;
          return (
            <g key={i}>
              {isLast && <circle cx={p.x} cy={p.y} r="10" fill="none"
                stroke={color} strokeWidth="1" opacity="0.3"/>}
              <circle cx={p.x} cy={p.y} r={isLast ? 5 : 3.5}
                fill={isLast ? color : "var(--s1)"}
                stroke={color} strokeWidth="2"/>
            </g>
          );
        })}

        {/* X labels */}
        {xUnique.map((p, i) => (
          <text key={i} x={p.x} y={H - 4} textAnchor="middle"
            fill="rgba(255,255,255,0.22)" fontSize="9" fontFamily="Inter,sans-serif">
            {p.date}
          </text>
        ))}
      </svg>
    </div>
  );
}

/* ── MEAL CARD ────────────────────────────────────────────────── */
function MealCard({ mealKey, items }) {
  const [open, setOpen] = useState(false);
  const meta = MEAL_META[mealKey];
  if (!items || items.length === 0) return null;

  const totalCal  = items.reduce((s, f) => s + (parseFloat(f.calories) || 0), 0);
  const totalProt = items.reduce((s, f) => s + (parseFloat(f.protein)  || 0), 0);
  const totalCarb = items.reduce((s, f) => s + (parseFloat(f.carbs)    || 0), 0);
  const totalFat  = items.reduce((s, f) => s + (parseFloat(f.fats)     || 0), 0);

  return (
    <div className={`meal-card ${open ? "open" : ""}`}>
      <button className="meal-card-head" onClick={() => setOpen(o => !o)}>
        <div className="meal-head-left">
          <div className="meal-emoji-wrap" style={{ background: meta.bg }}>
            <span style={{ fontSize: 20 }}>{meta.emoji}</span>
          </div>
          <div>
            <div className="meal-name">{meta.label}</div>
            <div className="meal-count">{items.length} item{items.length !== 1 ? "s" : ""}</div>
          </div>
        </div>
        <div className="meal-head-right">
          <div className="meal-kcal-chip">{totalCal} kcal</div>
          <span className={`meal-chevron ${open ? "rotated" : ""}`}>{Icon.chevron}</span>
        </div>
      </button>

      {open && (
        <>
          <div className="meal-items">
            {items.map((food, i) => (
              <div key={i} className="food-row">
                <div className="food-row-top">
                  <div className="food-name">{food.food || "—"}</div>
                  {food.quantity && <div className="food-qty">{food.quantity}</div>}
                </div>
                <div className="food-row-macros">
                  {food.calories && <span className="fm cal">{food.calories} kcal</span>}
                  {food.protein  && <span className="fm prot">P {food.protein}g</span>}
                  {food.carbs    && <span className="fm carb">C {food.carbs}g</span>}
                  {food.fats     && <span className="fm fat">F {food.fats}g</span>}
                </div>
                {food.notes && <div className="food-notes">{food.notes}</div>}
              </div>
            ))}
          </div>
          <div className="meal-macros-row">
            <span className="fm cal">{totalCal} kcal</span>
            <span className="fm prot">P {totalProt}g</span>
            <span className="fm carb">C {totalCarb}g</span>
            <span className="fm fat">F {totalFat}g</span>
          </div>
        </>
      )}
    </div>
  );
}

/* ── WEIGHT ROW ───────────────────────────────────────────────── */
function WeightRow({ entry, prev }) {
  const diff = prev ? (parseFloat(entry.weight) - parseFloat(prev.weight)).toFixed(1) : null;
  const isDown = diff !== null && diff < 0;
  return (
    <div className="wh-row">
      <div className="wh-date">{entry.date}</div>
      <div className="wh-vals">
        <span className="wh-weight">{entry.weight} kg</span>
        {diff !== null && (
          <span className={`wh-diff ${isDown ? "down" : "up"}`}>
            {isDown ? "▼" : "▲"} {Math.abs(diff)}
          </span>
        )}
      </div>
      <div className="wh-extra">
        {entry.bmi     && <span className="wh-tag">BMI {entry.bmi}</span>}
        {entry.bodyFat && <span className="wh-tag">Fat {entry.bodyFat}%</span>}
        {entry.muscle  && <span className="wh-tag">Msc {entry.muscle}%</span>}
      </div>
    </div>
  );
}

/* ── INACTIVE ─────────────────────────────────────────────────── */
function InactiveScreen() {
  return (
    <div className="inactive-screen">
      <div className="inactive-card">
        <div className="ic-visual">
          <div className="ic-pulse"/>
          <div className="ic-ring-outer">
            <div className="ic-ring-inner">⏸</div>
          </div>
        </div>
        <div className="ic-title">Plan Paused</div>
        <div className="ic-sub">
          Your subscription is currently inactive.
          Reach out to Coach Bahaa to reactivate your plan and get back on track.
        </div>
        <a href="https://wa.me/201234567890" target="_blank" rel="noreferrer" className="ic-cta">
          <span className="ic-cta-icon">{Icon.whatsapp}</span>
          Message Coach Bahaa
        </a>
      </div>
    </div>
  );
}

/* ── MAIN ─────────────────────────────────────────────────────── */
export default function UserPage() {
  const { user, userData, logout } = useAuth();
  const [tab,         setTab]         = useState("overview");
  const [plan,        setPlan]        = useState(null);
  const [weights,     setWeights]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  const isInactive = userData?.status !== "active";

  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const plansQuery = query(collection(db, "plans"), where("userId", "==", user.uid));
        const plansSnap = await getDocs(plansQuery);
        if (!plansSnap.empty) setPlan(plansSnap.docs[0].data());

        const q    = query(collection(db, "weightHistory"), where("userId", "==", user.uid));
        const snap = await getDocs(q);
        const sorted = snap.docs.map(d => d.data()).sort((a,b) => new Date(a.date) - new Date(b.date));
        setWeights(sorted);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  if (loading) return (
    <div className="up-loading"><div className="up-spinner"/></div>
  );

  if (isInactive) return (
    <div className="up-root">
      <div className="up-topbar">
        <div className="up-brand">
          <div className="up-brand-icon">🏋️</div>
          GymCoach
        </div>
        <button className="up-logout" onClick={logout}>{Icon.logout}</button>
      </div>
      <InactiveScreen/>
    </div>
  );

  const lastWeight = weights.length ? weights[weights.length - 1] : null;
  const initial    = userData?.name?.charAt(0).toUpperCase() || "U";

  return (
    <div className="up-root">

      {/* ── TOPBAR ── */}
      <div className="up-topbar">
        <div className="up-brand">
          <div className="up-brand-icon">🏋️</div>
          GymCoach
        </div>
        <div className="up-topbar-right">
          <div className="up-user-chip">
            <div className="up-av">{initial}</div>
            <span>{userData?.name?.split(" ")[0]}</span>
          </div>
          <button className="up-logout" onClick={logout}>{Icon.logout}</button>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="up-scroll">

        {/* ════════ OVERVIEW ════════ */}
        {tab === "overview" && (
          <div className="up-tab-content">

            {/* Hero */}
            <div className="profile-hero">
              <div className="hero-glow"/>
              <div className="hero-glow-2"/>

              <div className="hero-main">
                <div className="hero-av-wrap">
                  <div className="hero-av-ring">
                    <div className="hero-av">{initial}</div>
                  </div>
                  <div className="hero-status-dot"/>
                </div>
                <div className="hero-info">
                  <div className="hero-name">{userData?.name || "—"}</div>
                  <div className="hero-email">{userData?.email || "—"}</div>
                  <div className="hero-badges">
                    <span className="hero-badge active">✅ Active</span>
                    {userData?.goal && <span className="hero-badge goal">🎯 {userData.goal}</span>}
                  </div>
                </div>
              </div>

              <div className="hero-quick-stats">
                <div className="hqs-item">
                  <div className="hqs-val">
                    {userData?.currentWeight ?? lastWeight?.weight ?? "—"}
                    <span className="hqs-unit">kg</span>
                  </div>
                  <div className="hqs-lbl">Current</div>
                </div>
                <div className="hqs-item">
                  <div className="hqs-val">
                    {userData?.targetWeight ?? "—"}
                    <span className="hqs-unit">kg</span>
                  </div>
                  <div className="hqs-lbl">Target</div>
                </div>
                <div className="hqs-item">
                  <div className="hqs-val">{userData?.remainingSessions ?? "—"}</div>
                  <div className="hqs-lbl">Sessions left</div>
                </div>
              </div>
            </div>

            {/* Stat cards */}
            <div className="ov-stats">
              <div className="ov-stat-card">
                <div className="osc-accent-line" style={{ background: "linear-gradient(90deg, #00e676, #00bcd4)" }}/>
                <div className="osc-icon-wrap" style={{ background: "rgba(0,230,118,0.1)", color: "#00e676" }}>{Icon.scale}</div>
                <div className="osc-val">{userData?.currentWeight ?? lastWeight?.weight ?? "—"}<span className="osc-unit">kg</span></div>
                <div className="osc-lbl">Current Weight</div>
              </div>
              <div className="ov-stat-card">
                <div className="osc-accent-line" style={{ background: "linear-gradient(90deg, #ff6b35, #ff3d71)" }}/>
                <div className="osc-icon-wrap" style={{ background: "rgba(255,107,53,0.1)", color: "#ff6b35" }}>{Icon.target}</div>
                <div className="osc-val">{userData?.targetWeight ?? "—"}<span className="osc-unit">kg</span></div>
                <div className="osc-lbl">Target Weight</div>
              </div>
              <div className="ov-stat-card">
                <div className="osc-accent-line" style={{ background: "linear-gradient(90deg, #4d9fff, #b388ff)" }}/>
                <div className="osc-icon-wrap" style={{ background: "rgba(77,159,255,0.1)", color: "#4d9fff" }}>{Icon.ruler}</div>
                <div className="osc-val">{userData?.height ?? "—"}<span className="osc-unit">cm</span></div>
                <div className="osc-lbl">Height</div>
              </div>
              <div className="ov-stat-card">
                <div className="osc-accent-line" style={{ background: "linear-gradient(90deg, #ff3d71, #ff6b35)" }}/>
                <div className="osc-icon-wrap" style={{ background: "rgba(255,61,113,0.1)", color: "#ff3d71" }}>{Icon.fire}</div>
                <div className="osc-val">{userData?.remainingSessions ?? "—"}</div>
                <div className="osc-lbl">Sessions Left</div>
              </div>
            </div>

            {/* Profile details */}
            <div className="details-card">
              <div className="dc-title">Profile Details</div>
              {[
                ["Age",            userData?.age           ? `${userData.age} yrs`            : "—"],
                ["Height",         userData?.height        ? `${userData.height} cm`          : "—"],
                ["Current Weight", userData?.currentWeight ? `${userData.currentWeight} kg`   : "—"],
                ["Target Weight",  userData?.targetWeight  ? `${userData.targetWeight} kg`    : "—"],
                ["Goal",           userData?.goal          || "—"],
                ["Sessions Left",  userData?.remainingSessions ?? "—"],
              ].map(([label, val]) => (
                <div className="dc-row" key={label}>
                  <span className="dc-label">{label}</span>
                  <span className="dc-val">{val}</span>
                </div>
              ))}
            </div>

            {/* Latest measurement */}
            {lastWeight && (
              <div className="details-card">
                <div className="dc-title">Latest Measurement</div>
                {[
                  ["Date",     lastWeight.date],
                  ["Weight",   lastWeight.weight  ? `${lastWeight.weight} kg`  : "—"],
                  ["BMI",      lastWeight.bmi     ? lastWeight.bmi             : "—"],
                  ["Body Fat", lastWeight.bodyFat ? `${lastWeight.bodyFat}%`   : "—"],
                  ["Muscle",   lastWeight.muscle  ? `${lastWeight.muscle}%`    : "—"],
                  ["Water",    lastWeight.water   ? `${lastWeight.water}%`     : "—"],
                ].map(([label, val]) => (
                  <div className="dc-row" key={label}>
                    <span className="dc-label">{label}</span>
                    <span className="dc-val">{val}</span>
                  </div>
                ))}
                {lastWeight.notes && <div className="dc-notes">{lastWeight.notes}</div>}
              </div>
            )}
          </div>
        )}

        {/* ════════ PLAN ════════ */}
        {tab === "plan" && (
          <div className="up-tab-content">
            {!plan ? (
              <div className="empty-state">
                <div className="es-icon">📋</div>
                <div className="es-title">No plan yet</div>
                <div className="es-sub">Coach Bahaa hasn't set your plan yet. Check back soon!</div>
              </div>
            ) : (
              <>
                <div className="plan-header">
                  <div className="plan-header-title">Nutrition Plan</div>
                  {plan.updatedAt?.toDate && (
                    <div className="plan-updated">
                      Updated {plan.updatedAt.toDate().toLocaleDateString()}
                    </div>
                  )}
                </div>

                <div className="meals-list">
                  {MEAL_ORDER.map(key => (
                    <MealCard key={key} mealKey={key} items={plan[key]}/>
                  ))}
                </div>

                {(plan.waterIntake || plan.cardio || plan.supplements || plan.generalNotes) && (
                  <div className="plan-extras">
                    {plan.waterIntake  && <div className="pe-item"><div className="pe-label">💧 Water</div><div className="pe-val">{plan.waterIntake}</div></div>}
                    {plan.cardio       && <div className="pe-item"><div className="pe-label">🏃 Cardio</div><div className="pe-val">{plan.cardio}</div></div>}
                    {plan.supplements  && <div className="pe-item"><div className="pe-label">💊 Supplements</div><div className="pe-val">{plan.supplements}</div></div>}
                    {plan.generalNotes && <div className="pe-item"><div className="pe-label">📌 Notes</div><div className="pe-val">{plan.generalNotes}</div></div>}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ════════ PROGRESS ════════ */}
        {tab === "progress" && (
          <div className="up-tab-content">
            {weights.length === 0 ? (
              <div className="empty-state">
                <div className="es-icon">📊</div>
                <div className="es-title">No data yet</div>
                <div className="es-sub">Coach Bahaa will log your measurements over time.</div>
              </div>
            ) : (
              <>
                {weights.length >= 2 && (() => {
                  const first = parseFloat(weights[0].weight);
                  const last  = parseFloat(weights[weights.length - 1].weight);
                  const diff  = (last - first).toFixed(1);
                  const isDown = diff < 0;
                  return (
                    <div className="prog-summary">
                      <div className="ps-card">
                        <div className="ps-label">Started</div>
                        <div className="ps-val">{first} kg</div>
                      </div>
                      <div className="ps-card highlight">
                        <div className="ps-label">Total Change</div>
                        <div className={`ps-val ${isDown ? "green" : "orange"}`}>
                          {isDown ? "▼" : "▲"} {Math.abs(diff)} kg
                        </div>
                      </div>
                      <div className="ps-card">
                        <div className="ps-label">Now</div>
                        <div className="ps-val">{last} kg</div>
                      </div>
                    </div>
                  );
                })()}

                <div className="chart-card">
                  <WeightChart entries={weights}/>
                </div>

                <button className="history-toggle" onClick={() => setShowHistory(h => !h)}>
                  <span>⚖️ Weight History</span>
                  <span className={`ht-arrow ${showHistory ? "open" : ""}`}>{Icon.chevron}</span>
                </button>

                {showHistory && (
                  <div className="wh-list">
                    {[...weights].reverse().map((entry, i, arr) => (
                      <WeightRow key={i} entry={entry} prev={arr[i + 1] ?? null}/>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* ── FLOATING ISLAND NAV ── */}
      <nav className="up-bottom-nav">
        <div className="bn-track">
          {[
            { key: "overview", icon: Icon.grid,  label: "Overview" },
            { key: "plan",     icon: Icon.plan,  label: "My Plan"  },
            { key: "progress", icon: Icon.chart, label: "Progress" },
          ].map(item => (
            <button
              key={item.key}
              className={`bn-btn ${tab === item.key ? "active" : ""}`}
              onClick={() => setTab(item.key)}
            >
              <span className="bn-icon">{item.icon}</span>
              <span className="bn-lbl">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

    </div>
  );
} 