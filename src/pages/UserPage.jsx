import { useState, useEffect } from "react";
import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/config";
import "../styles/user.css";

/* ── ICONS ────────────────────────────────────────────────────── */
const Icon = {
  grid:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
  plan:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>,
  chart:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  book:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  logout:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  whatsapp:<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.557 4.118 1.529 5.845L.057 23.852l6.185-1.622A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.6a9.6 9.6 0 0 1-4.9-1.344l-.35-.208-3.632.953.97-3.54-.228-.364A9.6 9.6 0 1 1 12 21.6z"/></svg>,
  chevron: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>,
  shuffle: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>,
  close:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  tools:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,refresh: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M3 21v-5h5"/></svg>
};

const MEAL_META = {
  breakfast: { label: "Breakfast", emoji: "🌅", color: "#ff9d47", bg: "rgba(255,157,71,0.12)" },
  snack1:    { label: "Snack 1",   emoji: "🧁", color: "#ff5c8a", bg: "rgba(255,92,138,0.12)" },
  lunch:     { label: "Lunch",     emoji: "☀️", color: "#ffd23f", bg: "rgba(255,210,63,0.12)" },
  snack2:    { label: "Snack 2",   emoji: "🧁", color: "#ff5c8a", bg: "rgba(255,92,138,0.12)" },
  dinner:    { label: "Dinner",    emoji: "🌙", color: "#b388ff", bg: "rgba(179,136,255,0.12)" },
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

  const yTicks = [max, (max + min) / 2, min].map(v => ({
    y: PAD.t + (1 - (v - min) / (max - min)) * iH,
    label: Math.round(v),
  }));

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

        <path d={areaPath} fill="url(#wg)"/>
        <path d={linePath} fill="none" stroke={color} strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" filter="url(#line-glow)"/>

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

/* ── MEAL ROW (one alternative shown, "Change" cycles the array) ── */
function MealRow({ mealKey, options, selectedIdx, onChange }) {
  const meta = MEAL_META[mealKey];
  if (!options || options.length === 0) return null;

  const idx  = selectedIdx % options.length;
  const item = options[idx];
  const hasAlts = options.length > 1;

  return (
    <div className="meal-row">
      <div className="meal-row-icon" style={{ background: meta.bg, color: meta.color }}>
        <span>{meta.emoji}</span>
      </div>

      <div className="meal-row-label">
        <div className="meal-row-name">{meta.label}</div>
        <div className="meal-row-kcal" style={{ color: meta.color }}>
          {item.calories ? `${item.calories} kcal` : "—"}
        </div>
      </div>

      <div className="meal-row-food">
        <div className="meal-row-thumb">
          {item.image
            ? <img src={item.image} alt={item.food || ""} onError={e => e.target.style.display = "none"} />
            : <span>🍽️</span>}
        </div>
        <div className="meal-row-food-info">
          <div className="meal-row-food-name">{item.food || "—"}</div>
          <div className="meal-row-food-macros">
            {item.protein && <span>P: {item.protein}g</span>}
            {item.carbs   && <span>C: {item.carbs}g</span>}
            {item.fats    && <span>F: {item.fats}g</span>}
          </div>
        </div>
      </div>

      {hasAlts && (
        <button
          className="meal-row-change"
          style={{ color: meta.color }}
          onClick={() => onChange(mealKey, (idx + 1) % options.length)}
        >
          Change <span className="mrc-icon">{Icon.refresh}</span>
        </button>
      )}
    </div>
  );
}

/* ── PROGRESS RING (daily total vs coach target) ── */
function ProgressRing({ percent }) {
  const r = 28, c = 2 * Math.PI * r;
  const p = Math.min(100, Math.max(0, percent));
  const dash = (p / 100) * c;
  return (
    <svg viewBox="0 0 68 68" className="dt-ring">
      <circle cx="34" cy="34" r={r} fill="none" stroke="var(--border)" strokeWidth="5" />
      <circle cx="34" cy="34" r={r} fill="none" stroke="var(--green)" strokeWidth="5"
        strokeDasharray={`${dash} ${c}`} strokeLinecap="round" transform="rotate(-90 34 34)" />
      <text x="34" y="31" textAnchor="middle" fontSize="14" fontWeight="800" fill="var(--text)">{Math.round(p)}%</text>
      <text x="34" y="44" textAnchor="middle" fontSize="7.5" fill="var(--muted)">Goal</text>
    </svg>
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

/* ── RECIPES ──────────────────────────────────────────────────── */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function splitList(text) {
  if (!text) return [];
  return text
    .split(/\r?\n|,(?=\s*[A-Za-z0-9])/)
    .map(s => s.trim())
    .filter(Boolean);
}

function RecipeCard({ recipe, onOpen }) {
  const title = recipe.description || recipe.name || "Untitled Recipe";
  const meal  = recipe.mealType || "";

  return (
    <button className="recipe-card-u" onClick={() => onOpen(recipe)}>
      <div className="recipe-card-u-img">
        {recipe.image
          ? <img src={recipe.image} alt={title} onError={e => { e.target.style.display = "none"; }} />
          : <span>🍽️</span>}
      </div>
      <div className="recipe-card-u-body">
        {meal && <div className="recipe-card-u-meal">{meal}</div>}
        <div className="recipe-card-u-title">{title}</div>
        {recipe.ingredients && (
          <div className="recipe-card-u-ingr">{recipe.ingredients}</div>
        )}
        <div className="recipe-card-u-macros">
          {recipe.calories && <span className="fm cal">{recipe.calories} kcal</span>}
          {recipe.protein  && <span className="fm prot">P {recipe.protein}g</span>}
          {recipe.carbs    && <span className="fm carb">C {recipe.carbs}g</span>}
          {recipe.fat      && <span className="fm fat">F {recipe.fat}g</span>}
        </div>
      </div>
      <span className="recipe-card-u-arrow">{Icon.chevron}</span>
    </button>
  );
}

function RecipeDetailModal({ recipe, onClose }) {
  if (!recipe) return null;
  const title = recipe.description || recipe.name || "Untitled Recipe";
  const ingredients = splitList(recipe.ingredients);

  return (
    <div className="rmodal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="rmodal-sheet">
        <button className="rmodal-close" onClick={onClose}>{Icon.close}</button>

        <div className="rmodal-img-wrap">
          {recipe.image
            ? <img src={recipe.image} alt={title} onError={e => { e.target.style.display = "none"; }} />
            : <div className="rmodal-img-fallback">🍽️</div>}
          {recipe.mealType && <span className="rmodal-meal-badge">{recipe.mealType}</span>}
        </div>

        <div className="rmodal-body">
          <div className="rmodal-title">{title}</div>

          {(recipe.calories || recipe.protein || recipe.carbs || recipe.fat) && (
            <div className="rmodal-macros">
              {recipe.calories && (
                <div className="rmodal-macro">
                  <span className="rmm-val cal">{recipe.calories}</span>
                  <span className="rmm-lbl">kcal</span>
                </div>
              )}
              {recipe.protein && (
                <div className="rmodal-macro">
                  <span className="rmm-val prot">{recipe.protein}g</span>
                  <span className="rmm-lbl">Protein</span>
                </div>
              )}
              {recipe.carbs && (
                <div className="rmodal-macro">
                  <span className="rmm-val carb">{recipe.carbs}g</span>
                  <span className="rmm-lbl">Carbs</span>
                </div>
              )}
              {recipe.fat && (
                <div className="rmodal-macro">
                  <span className="rmm-val fat">{recipe.fat}g</span>
                  <span className="rmm-lbl">Fat</span>
                </div>
              )}
            </div>
          )}

          {ingredients.length > 0 && (
            <div className="rmodal-section">
              <div className="rmodal-section-title">🧾 Ingredients & Steps</div>
              <ul className="rmodal-ingr-list">
                {ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RecipesSection() {
  const [recipes, setRecipes] = useState([]);
  const [order,   setOrder]   = useState([]);
  const [page,    setPage]    = useState(0);
  const [loading, setLoading] = useState(true);
  const [openRecipe, setOpenRecipe] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "Recipes"), snap => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setRecipes(list);
      setOrder(shuffle(list.map(r => r.id)));
      setPage(0);
      setLoading(false);
    }, err => { console.error(err); setLoading(false); });
    return () => unsub();
  }, []);

  const perPage = 3;
  const totalPages = Math.max(1, Math.ceil(order.length / perPage));

  function nextThree() {
    setPage(p => {
      const n = p + 1;
      if (n >= totalPages) {
        setOrder(shuffle(recipes.map(r => r.id)));
        return 0;
      }
      return n;
    });
  }

  const visible = order
    .slice(page * perPage, page * perPage + perPage)
    .map(id => recipes.find(r => r.id === id))
    .filter(Boolean);

  if (loading) return <div className="loading-row">Loading recipes…</div>;

  if (recipes.length === 0) {
    return (
      <div className="empty-state">
        <div className="es-icon">📖</div>
        <div className="es-title">No recipes yet</div>
        <div className="es-sub">Coach Bahaa hasn't added any recipes yet. Check back soon!</div>
      </div>
    );
  }

  return (
    <div className="up-tab-content">
      <div className="recipes-u-header">
        <div>
          <div className="plan-header-title">Recipes</div>
          <div className="plan-updated">{recipes.length} available</div>
        </div>
      </div>

      <div className="recipes-u-grid">
        {visible.map(r => <RecipeCard key={r.id} recipe={r} onOpen={setOpenRecipe} />)}
      </div>

      {recipes.length > 3 && (
        <button className="recipes-u-next" onClick={nextThree}>
          <span className="ru-next-icon">{Icon.shuffle}</span>
          3 more recipes
        </button>
      )}

      <RecipeDetailModal recipe={openRecipe} onClose={() => setOpenRecipe(null)} />
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

/* ── NAV ITEMS (shared between sidebar + bottom nav) ─────────────── */
const TABS = [
  { key: "overview", icon: Icon.grid,  label: "Home"     },
  { key: "plan",     icon: Icon.plan,  label: "My Plan"  },
  { key: "recipes",  icon: Icon.book,  label: "Recipes"  },
  { key: "progress", icon: Icon.chart, label: "Progress" },
];

/* ── MAIN ─────────────────────────────────────────────────────── */
export default function UserPage() {
  const { user, userData, logout } = useAuth();
  const [tab,         setTab]         = useState("overview");
  const [plan,        setPlan]        = useState(null);
  const [weights,     setWeights]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [selected, setSelected] = useState({}); // { breakfast: 0, lunch: 1, ... } — index البديل المختار حاليًا
function handleMealChange(mealKey, idx) {
  setSelected(s => ({ ...s, [mealKey]: idx }));
}

function getSelectedItem(mealKey) {
  const options = plan?.[mealKey];
  if (!options || options.length === 0) return null;
  const idx = (selected[mealKey] || 0) % options.length;
  return options[idx];
}

const planTotals = MEAL_ORDER.reduce((acc, key) => {
  const item = getSelectedItem(key);
  if (item) {
    acc.cal  += Number(item.calories) || 0;
    acc.prot += Number(item.protein)  || 0;
    acc.carb += Number(item.carbs)    || 0;
    acc.fat  += Number(item.fats)     || 0;
  }
  return acc;
}, { cal: 0, prot: 0, carb: 0, fat: 0 });
  const isInactive = userData?.status !== "active";
  const isAdmin    = userData?.role === "admin"; // عدّل اسم الفيلد هنا لو مختلف عندك

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
    <div className="up-shell">
      <div className="up-main">
        <div className="up-topbar">
          <div className="up-brand">
            <div className="up-brand-icon">🏋️</div>
            GymCoach
          </div>
          <div className="up-topbar-right">
            {isAdmin && (
              <button className="up-dash-btn" onClick={() => (window.location.href = "/admin")}>
                {Icon.tools} Dashboard
              </button>
            )}
            <button className="up-logout" onClick={logout}>{Icon.logout}</button>
          </div>
        </div>
        <InactiveScreen/>
      </div>
    </div>
  );

  const lastWeight = weights.length ? weights[weights.length - 1] : null;
  const initial    = userData?.name?.charAt(0).toUpperCase() || "U";
  const firstName  = userData?.name?.split(" ")[0] || "there";

  return (
    <div className="up-shell">

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="up-sidebar">
        <div className="up-sidebar-brand">🏋️</div>
        <nav className="up-sidebar-nav">
          {TABS.map(item => (
            <button
              key={item.key}
              className={`up-sidebar-btn ${tab === item.key ? "active" : ""}`}
              onClick={() => setTab(item.key)}
              title={item.label}
            >
              {item.icon}
            </button>
          ))}
        </nav>
        <div className="up-sidebar-spacer" />
        {isAdmin && (
          <button className="up-sidebar-btn" onClick={() => (window.location.href = "/admin")} title="Admin Dashboard">
            {Icon.tools}
          </button>
        )}
        <button className="up-sidebar-btn" onClick={logout} title="Logout">{Icon.logout}</button>
      </aside>

      <div className="up-main">
        {/* ── TOPBAR ── */}
        <div className="up-topbar">
          <div className="up-brand">
            <div className="up-brand-icon">🏋️</div>
            GymCoach
          </div>
          <div className="up-topbar-right">
            {isAdmin && (
              <button className="up-dash-btn" onClick={() => (window.location.href = "/admin")}>
                {Icon.tools} Dashboard
              </button>
            )}
            <div className="up-user-chip">
              <div className="up-av">{initial}</div>
              <span>{firstName}</span>
            </div>
            <button className="up-logout" onClick={logout}>{Icon.logout}</button>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div className="up-scroll">

          {/* ════════ OVERVIEW ════════ */}
          {tab === "overview" && (
            <div className="up-tab-content" style={{ paddingTop: 0 }}>

              <div className="hero-photo">
                <img src="/coach.jpg" alt="" className="hero-photo-img" />
                <div className="hero-photo-content">
                  <div className="hero-greet">Welcome back</div>
                  <div className="hero-photo-name">{firstName} 👋</div>
                  <div className="hero-photo-line">Discipline today, results tomorrow. Keep pushing forward!</div>
                  <div className="hero-photo-badges">
                    <span className="hero-badge active">⚡ {userData?.remainingSessions ?? 0} Sessions Left</span>
                    {userData?.goal && <span className="hero-badge goal">🎯 {userData.goal}</span>}
                  </div>
                </div>
              </div>

              <div className="stat-strip">
                <div className="stat-chip">
                  <div className="stat-chip-icon">⚖️</div>
                  <div className="stat-chip-val">{userData?.currentWeight ?? lastWeight?.weight ?? "—"}<span className="stat-chip-unit">kg</span></div>
                  <div className="stat-chip-lbl">Current</div>
                </div>
                <div className="stat-chip">
                  <div className="stat-chip-icon">🎯</div>
                  <div className="stat-chip-val">{userData?.targetWeight ?? "—"}<span className="stat-chip-unit">kg</span></div>
                  <div className="stat-chip-lbl">Target</div>
                </div>
                <div className="stat-chip">
                  <div className="stat-chip-icon">📏</div>
                  <div className="stat-chip-val">{userData?.height ?? "—"}<span className="stat-chip-unit">cm</span></div>
                  <div className="stat-chip-lbl">Height</div>
                </div>
                <div className="stat-chip">
                  <div className="stat-chip-icon">🔥</div>
                  <div className="stat-chip-val">{userData?.remainingSessions ?? "—"}</div>
                  <div className="stat-chip-lbl">Sessions</div>
                </div>
              </div>

              {weights.length >= 2 && (
                <div className="chart-card">
                  <WeightChart entries={weights}/>
                </div>
              )}

              <div className="details-grid">
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
            </div>
          )}

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

        <div className="plan-summary-bar">
          <div className="psb-goal">
            <div className="psb-icon">🎯</div>
            <div>
              <div className="psb-lbl">{plan.calorieTarget ? "Today's Goal" : "Planned Today"}</div>
              <div className="psb-val">{plan.calorieTarget ?? planTotals.cal} kcal</div>
            </div>
          </div>
          <div className="psb-metric"><span className="psb-mlbl">Protein</span><span className="psb-mval">{planTotals.prot}g</span></div>
          <div className="psb-metric"><span className="psb-mlbl">Carbs</span><span className="psb-mval">{planTotals.carb}g</span></div>
          <div className="psb-metric"><span className="psb-mlbl">Fats</span><span className="psb-mval">{planTotals.fat}g</span></div>
        </div>

        <div className="meal-rows-list">
          {MEAL_ORDER.map(key => (
            <MealRow
              key={key}
              mealKey={key}
              options={plan[key]}
              selectedIdx={selected[key] || 0}
              onChange={handleMealChange}
            />
          ))}
        </div>

        {planTotals.cal > 0 && (
          <div className="daily-total-card">
            <div className="dt-icon">🎯</div>
            <div>
              <div className="dt-lbl">Daily Total</div>
              <div className="dt-val">{planTotals.cal} kcal</div>
            </div>
            <div className="dt-metric"><span className="dt-mlbl">Protein</span><span className="dt-mval">{planTotals.prot}g</span></div>
            <div className="dt-metric"><span className="dt-mlbl">Carbs</span><span className="dt-mval">{planTotals.carb}g</span></div>
            <div className="dt-metric"><span className="dt-mlbl">Fats</span><span className="dt-mval">{planTotals.fat}g</span></div>
            {plan.calorieTarget && <ProgressRing percent={(planTotals.cal / plan.calorieTarget) * 100} />}
          </div>
        )}

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

          {/* ════════ RECIPES ════════ */}
          {tab === "recipes" && <RecipesSection/>}

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

        {/* ── FLOATING ISLAND NAV (mobile only) ── */}
        <nav className="up-bottom-nav">
          <div className="bn-track">
            {TABS.map(item => (
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
    </div>
  );
}