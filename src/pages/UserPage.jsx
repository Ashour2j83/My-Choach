import { useState, useEffect, useRef } from "react";
import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
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
  tools:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
  refresh: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M3 21v-5h5"/></svg>,
  globe:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  droplet: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2s7 8.5 7 13a7 7 0 0 1-14 0c0-4.5 7-13 7-13z"/></svg>,
  muscle:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 4v3a3 3 0 0 0 3 3h1a3 3 0 0 1 3 3v1a3 3 0 0 0 3 3h2"/><path d="M18 4v3M20 6h-4"/></svg>,
  camera:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
};

const MEAL_META = {
  breakfast: { labelKey: "breakfast", emoji: "🌅", color: "#ff9d47", bg: "rgba(255,157,71,0.12)" },
  snack1:    { labelKey: "snack1",    emoji: "🧁", color: "#ff5c8a", bg: "rgba(255,92,138,0.12)" },
  lunch:     { labelKey: "lunch",     emoji: "☀️", color: "#ffd23f", bg: "rgba(255,210,63,0.12)" },
  snack2:    { labelKey: "snack2",    emoji: "🧁", color: "#ff5c8a", bg: "rgba(255,92,138,0.12)" },
  dinner:    { labelKey: "dinner",    emoji: "🌙", color: "#b388ff", bg: "rgba(179,136,255,0.12)" },
};

const MEAL_ORDER = ["breakfast","snack1","lunch","snack2","dinner"];

/* Split a meal's food text into separate items — one per line break (\n) */
function splitFoodLines(text) {
  if (!text) return [];
  return text
    .split(/\r?\n/)
    .map(s => s.trim())
    .filter(Boolean);
}

/* Catmull-Rom → cubic Bezier smoothing (natural curve through every point, no wild overshoot) */
function smoothPath(pts) {
  if (pts.length < 2) return "";
  if (pts.length === 2) return `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y}`;
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)} ${cp2x.toFixed(2)} ${cp2y.toFixed(2)} ${p2.x} ${p2.y}`;
  }
  return d;
}

function formatChartDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* ── Resize + compress an image file in the browser before upload ──
   Keeps the payload well under Vercel's request-size limit and speeds
   up upload on slow mobile connections. Returns a base64 data URI. */
function resizeImageFile(file, maxDim = 1000, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height >= width && height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("Couldn't read image"));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error("Couldn't read file"));
    reader.readAsDataURL(file);
  });
}

/* ── WEIGHT CHART (violet, smooth curve, animated) ── */
function WeightChart({ entries }) {
  const { t } = useLanguage();
  if (!entries || entries.length < 2) return null;

  const sorted = [...entries].sort((a,b) => new Date(a.date) - new Date(b.date));
  const weights = sorted.map(e => parseFloat(e.weight)).filter(Boolean);
  if (!weights.length) return null;

  const min = Math.min(...weights) - 2;
  const max = Math.max(...weights) + 2;
  const W = 560, H = 220;
  const PAD = { t: 42, r: 18, b: 34, l: 40 };
  const iW = W - PAD.l - PAD.r;
  const iH = H - PAD.t - PAD.b;

  const pts = sorted.map((e, i) => ({
    x: PAD.l + (sorted.length === 1 ? iW / 2 : (i / (sorted.length - 1)) * iW),
    y: PAD.t + (1 - (parseFloat(e.weight) - min) / (max - min)) * iH,
    weight: parseFloat(e.weight),
    date: e.date,
  }));

  const linePath = smoothPath(pts);
  const areaPath = linePath + ` L ${pts[pts.length - 1].x} ${H - PAD.b} L ${pts[0].x} ${H - PAD.b} Z`;

  const first = weights[0], last = weights[weights.length - 1];
  const diff = (last - first).toFixed(1);
  const isDown = diff < 0;

  const yTicks = [max, (max + min) / 2, min].map(v => ({
    y: PAD.t + (1 - (v - min) / (max - min)) * iH,
    label: Math.round(v),
  }));

  return (
    <div className="wc-grid">
      <div className="wc-chart-col">
        <svg viewBox={`0 0 ${W} ${H}`} className="wc-svg">
          <defs>
            <linearGradient id="wg-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#b388ff" stopOpacity="0.35"/>
              <stop offset="100%" stopColor="#b388ff" stopOpacity="0"/>
            </linearGradient>
            <linearGradient id="wg-line" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="#9b6bff"/>
              <stop offset="55%"  stopColor="#c9a8ff"/>
              <stop offset="100%" stopColor="#b388ff"/>
            </linearGradient>
            <filter id="wg-glow" x="-30%" y="-60%" width="160%" height="260%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2.2" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          <text x={PAD.l - 10} y={16} textAnchor="end"
            fill="var(--wc-axis-text)" fontSize="10.5" fontFamily="Inter,sans-serif">
            kg
          </text>

          {yTicks.map((tck, i) => (
            <g key={i} className="wc-gridline" style={{ animationDelay: `${i * 0.08}s` }}>
              <line x1={PAD.l} y1={tck.y} x2={W - PAD.r} y2={tck.y}
                stroke="var(--wc-grid-line)" strokeWidth="1" strokeDasharray="4 6"/>
              <text x={PAD.l - 10} y={tck.y + 4} textAnchor="end"
                fill="var(--wc-axis-text)" fontSize="11" fontFamily="Inter,sans-serif">
                {tck.label}
              </text>
            </g>
          ))}

          <path className="wc-area" d={areaPath} fill="url(#wg-area)"/>
          <path className="wc-line" pathLength="1" d={linePath} fill="none"
            stroke="url(#wg-line)" strokeWidth="3"
            strokeLinecap="round" strokeLinejoin="round" filter="url(#wg-glow)"/>

          {pts.map((p, i) => {
            const isLast = i === pts.length - 1;
            const delay = 0.9 + i * 0.09;
            return (
              <g key={i}>
                <text className="wc-val-label" style={{ animationDelay: `${delay + 0.1}s` }}
                  x={p.x} y={p.y - 15} textAnchor="middle"
                  fill="var(--text)" fontSize="12" fontWeight="700" fontFamily="Inter,sans-serif">
                  {p.weight}
                </text>
                <circle
                  className={`wc-dot ${isLast ? "is-last" : ""}`}
                  style={{ animationDelay: `${delay}s` }}
                  cx={p.x} cy={p.y} r={isLast ? 6 : 4}
                  fill={isLast ? "#b388ff" : "var(--s1)"} stroke="#b388ff" strokeWidth="2"/>
                <text className="wc-date-label" style={{ animationDelay: `${delay + 0.1}s` }}
                  x={p.x} y={H - 10} textAnchor="middle"
                  fill="var(--wc-axis-text)" fontSize="10" fontFamily="Inter,sans-serif">
                  {formatChartDate(p.date)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="wc-summary-col">
        <div className="wc-summary-lbl">{t("currentWeight")}</div>
        <div className="wc-summary-val">{last}<span>kg</span></div>
        <div className={`wc-summary-delta ${isDown ? "down" : "up"}`}>
          {isDown ? "▼" : "▲"} {Math.abs(diff)} kg
        </div>
        <div className="wc-summary-sub">{t("vsLastMonth")}</div>
      </div>
    </div>
  );
}

/* ── METRIC CARD (Weight / Body Fat / BMI / Muscle) ─────────────── */
function MetricCard({ icon, cls, label, value, unit, delta }) {
  return (
    <div className="metric-card">
      <div className={`metric-icon ${cls}`}>{icon}</div>
      <div className="metric-lbl">{label}</div>
      <div className="metric-val">{value}<span className="metric-unit">{unit}</span></div>
      {delta != null && (
        <div className={`metric-delta ${delta < 0 ? "down" : "up"}`}>
          {delta < 0 ? "▼" : "▲"} {Math.abs(delta)}{unit === "kg" ? " kg" : "%"}
        </div>
      )}
    </div>
  );
}

/* ── MEAL ROW (one alternative shown, "Change" cycles the array) ── */
function MealRow({ mealKey, options, selectedIdx, onChange }) {
  const { t } = useLanguage();
  const meta = MEAL_META[mealKey];
  if (!options || options.length === 0) return null;

  const idx  = selectedIdx % options.length;
  const item = options[idx];
  const hasAlts = options.length > 1;
  const foodLines = splitFoodLines(item.food);

  return (
    <div className="meal-row">
      <div className="meal-row-icon" style={{ background: meta.bg, color: meta.color }}>
        <span>{meta.emoji}</span>
      </div>

      <div className="meal-row-label">
        <div className="meal-row-name">{t(meta.labelKey)}</div>
        <div className="meal-row-kcal" style={{ color: meta.color }}>
          {item.calories ? `${item.calories} kcal` : "—"}
        </div>
      </div>

      <div className="meal-row-food">
        {foodLines.length > 0 ? (
          <ul className="meal-row-food-list">
            {foodLines.map((line, i) => <li key={i}>{line}</li>)}
          </ul>
        ) : (
          <div className="meal-row-food-list-empty">—</div>
        )}
        <div className="meal-row-food-macros">
          {item.protein && <span>P: {item.protein}g</span>}
          {item.carbs   && <span>C: {item.carbs}g</span>}
          {item.fats    && <span>F: {item.fats}g</span>}
        </div>
      </div>

      {hasAlts && (
        <button
          className="meal-row-change"
          style={{ color: meta.color }}
          onClick={() => onChange(mealKey, (idx + 1) % options.length)}
        >
          {t("change")} <span className="mrc-icon">{Icon.refresh}</span>
        </button>
      )}
    </div>
  );
}

/* ── PROGRESS RING (daily total vs coach target) ── */
function ProgressRing({ percent }) {
  const { t } = useLanguage();
  const r = 28, c = 2 * Math.PI * r;
  const p = Math.min(100, Math.max(0, percent));
  const dash = (p / 100) * c;
  return (
    <svg viewBox="0 0 68 68" className="dt-ring">
      <circle cx="34" cy="34" r={r} fill="none" stroke="var(--border)" strokeWidth="5" />
      <circle cx="34" cy="34" r={r} fill="none" stroke="var(--green)" strokeWidth="5"
        strokeDasharray={`${dash} ${c}`} strokeLinecap="round" transform="rotate(-90 34 34)" />
      <text x="34" y="31" textAnchor="middle" fontSize="14" fontWeight="800" fill="var(--text)">{Math.round(p)}%</text>
      <text x="34" y="44" textAnchor="middle" fontSize="7.5" fill="var(--muted)">{t("goal")}</text>
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
  const { t } = useLanguage();
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
                  <span className="rmm-lbl">{t("protein")}</span>
                </div>
              )}
              {recipe.carbs && (
                <div className="rmodal-macro">
                  <span className="rmm-val carb">{recipe.carbs}g</span>
                  <span className="rmm-lbl">{t("carbs")}</span>
                </div>
              )}
              {recipe.fat && (
                <div className="rmodal-macro">
                  <span className="rmm-val fat">{recipe.fat}g</span>
                  <span className="rmm-lbl">{t("fats")}</span>
                </div>
              )}
            </div>
          )}

          {ingredients.length > 0 && (
            <div className="rmodal-section">
              <div className="rmodal-section-title">🧾 {t("ingredientsSteps")}</div>
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
  const { t } = useLanguage();
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
        <div className="es-title">{t("noRecipesYet")}</div>
        <div className="es-sub">{t("noRecipesSub")}</div>
      </div>
    );
  }

  return (
    <div className="up-tab-content">
      <div className="recipes-u-header">
        <div>
          <div className="plan-header-title">{t("recipes")}</div>
          <div className="plan-updated">{recipes.length} {t("available")}</div>
        </div>
      </div>

      <div className="recipes-u-grid">
        {visible.map(r => <RecipeCard key={r.id} recipe={r} onOpen={setOpenRecipe} />)}
      </div>

      {recipes.length > 3 && (
        <button className="recipes-u-next" onClick={nextThree}>
          <span className="ru-next-icon">{Icon.shuffle}</span>
          {t("moreRecipes")}
        </button>
      )}

      <RecipeDetailModal recipe={openRecipe} onClose={() => setOpenRecipe(null)} />
    </div>
  );
}

/* ── INACTIVE ─────────────────────────────────────────────────── */
function InactiveScreen() {
  const { t } = useLanguage();
  return (
    <div className="inactive-screen">
      <div className="inactive-card">
        <div className="ic-visual">
          <div className="ic-pulse"/>
          <div className="ic-ring-outer">
            <div className="ic-ring-inner">⏸</div>
          </div>
        </div>
        <div className="ic-title">{t("planPaused")}</div>
        <div className="ic-sub">{t("planPausedSub")}</div>
        <a href="https://wa.me/201033554250" target="_blank" rel="noreferrer" className="ic-cta">
          <span className="ic-cta-icon">{Icon.whatsapp}</span>
          {t("messageCoach")}
        </a>
      </div>
    </div>
  );
}
const CROP_OUT_W = 1200;

function PhotoCropModal({ src, aspect, onCancel, onConfirm }) {
  const cropAspect = aspect || 16 / 9; // fallback لو القياس فشل لأي سبب
  const cropOutH   = Math.round(CROP_OUT_W / cropAspect);
  const frameRef = useRef(null);
  const imgRef   = useRef(null);
  const dragRef  = useRef({ dragging: false, startX: 0, startY: 0, startTx: 0, startTy: 0 });

  const [frameSize, setFrameSize] = useState({ w: 0, h: 0 });
  const [natural,   setNatural]   = useState(null); // { w, h }
  const [zoom,      setZoom]      = useState(1);
  const [pos,       setPos]       = useState({ x: 0, y: 0 }); // زاوية الصورة العلوية-الشمال، نسبة للإطار

  useEffect(() => {
    function measure() {
      if (!frameRef.current) return;
      const r = frameRef.current.getBoundingClientRect();
      setFrameSize({ w: r.width, h: r.height });
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const baseScale = natural && frameSize.w
    ? Math.max(frameSize.w / natural.w, frameSize.h / natural.h)
    : 1;
  const dispW = natural ? natural.w * baseScale * zoom : 0;
  const dispH = natural ? natural.h * baseScale * zoom : 0;

  function clamp(pt, w, h) {
    const minX = frameSize.w - w, maxX = 0;
    const minY = frameSize.h - h, maxY = 0;
    return {
      x: Math.min(maxX, Math.max(minX, pt.x)),
      y: Math.min(maxY, Math.max(minY, pt.y)),
    };
  }

  // أول ما نعرف مقاس الصورة الطبيعي ومقاس الإطار، نوسّط الصورة تلقائيًا
  useEffect(() => {
    if (!natural || !frameSize.w) return;
    setPos({ x: (frameSize.w - dispW) / 2, y: (frameSize.h - dispH) / 2 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [natural, frameSize.w, frameSize.h]);

  function handleImgLoad(e) {
    setNatural({ w: e.target.naturalWidth, h: e.target.naturalHeight });
  }

  function handleZoomChange(e) {
    const z = parseFloat(e.target.value);
    const newDispW = natural.w * baseScale * z;
    const newDispH = natural.h * baseScale * z;
    const cx = pos.x + dispW / 2, cy = pos.y + dispH / 2;
    const next = clamp({ x: cx - newDispW / 2, y: cy - newDispH / 2 }, newDispW, newDispH);
    setZoom(z);
    setPos(next);
  }

  function handlePointerDown(e) {
    dragRef.current = { dragging: true, startX: e.clientX, startY: e.clientY, startTx: pos.x, startTy: pos.y };
    e.target.setPointerCapture?.(e.pointerId);
  }
  function handlePointerMove(e) {
    if (!dragRef.current.dragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPos(clamp({ x: dragRef.current.startTx + dx, y: dragRef.current.startTy + dy }, dispW, dispH));
  }
  function handlePointerUp() {
    dragRef.current.dragging = false;
  }

  function handleConfirm() {
    const k = 1 / (baseScale * zoom);
    const sx = -pos.x * k;
    const sy = -pos.y * k;
    const sW = frameSize.w * k;
    const sH = frameSize.h * k;

    const canvas = document.createElement("canvas");
    canvas.width = CROP_OUT_W;
    canvas.height = cropOutH;
    canvas.getContext("2d").drawImage(imgRef.current, sx, sy, sW, sH, 0, 0, CROP_OUT_W, cropOutH);
    onConfirm(canvas.toDataURL("image/jpeg", 0.85));
  }

  return (
    <div className="crop-modal-overlay">
      <div className="crop-modal-sheet">
        <div className="crop-modal-title">Adjust photo</div>

        <div
  ref={frameRef}
  className="crop-frame"
  style={{ aspectRatio: cropAspect }}
  onPointerDown={handlePointerDown}
  onPointerMove={handlePointerMove}
  onPointerUp={handlePointerUp}
  onPointerCancel={handlePointerUp}
>
          <img
            ref={imgRef}
            src={src}
            alt=""
            draggable={false}
            onLoad={handleImgLoad}
            className="crop-frame-img"
            style={{ width: dispW || undefined, height: dispH || undefined, left: pos.x, top: pos.y, opacity: natural ? 1 : 0 }}
          />
        </div>

        <input
          type="range" min="1" max="3" step="0.01"
          value={zoom} onChange={handleZoomChange}
          className="crop-zoom-slider"
          disabled={!natural}
        />

        <div className="crop-modal-actions">
          <button type="button" className="crop-btn-cancel" onClick={onCancel}>Cancel</button>
          <button type="button" className="crop-btn-confirm" onClick={handleConfirm} disabled={!natural}>Use Photo</button>
        </div>
      </div>
    </div>
  );
}
/* ── MAIN ─────────────────────────────────────────────────────── */
export default function UserPage() {
  const { user, userData, logout } = useAuth();
  const { t, lang, toggleLang } = useLanguage();

  const [tab,         setTab]         = useState("overview");
  const [plan,        setPlan]        = useState(null);
  const [weights,     setWeights]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [selected,    setSelected]    = useState({});

  /* ── Profile photo upload ── */
  const fileInputRef = useRef(null);
  const heroPhotoRef   = useRef(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [localImg,       setLocalImg]       = useState(null); // instant preview after a successful upload
  const [uploadError,    setUploadError]    = useState("");

 const [cropSrc, setCropSrc] = useState(null); // object URL — لما تبقى موجودة، مودال الكروب مفتوح
 const [cropAspect, setCropAspect] = useState(16 / 9);

/* ════════════════════════════════════════════════════════
   ضيف الـ function دي فوق handlePhotoSelected مباشرة
   في UserPage.jsx
════════════════════════════════════════════════════════ */

function mapUploadError(status, serverMsg) {
  // Daily limit
  if (status === 429) {
    return "You've reached today's photo change limit. Try again tomorrow.";
  }

  // Session expired / unauthorized
  if (status === 401) {
    return "Your session has expired. Please sign in again.";
  }

  // User record missing in Firestore
  if (status === 404) {
    return "Unable to find your account.";
  }

  // Client-side validation errors (400) — map by content, never reveal internals
  if (status === 400) {
    const msg = (serverMsg || "").toLowerCase();

    if (msg.includes("no image") || msg.includes("empty")) {
      return "Please choose an image first.";
    }
    if (
      msg.includes("format") ||
      msg.includes("unsupported") ||
      msg.includes("doesn't match") ||
      msg.includes("declared")
    ) {
      return "Only JPG, PNG, WEBP, or GIF images are supported.";
    }
    if (msg.includes("2mb") || msg.includes("large") || msg.includes("size")) {
      return "Image must be under 2MB.";
    }
    // Any other 400 — still safe, just say "invalid"
    return "Please upload a valid image.";
  }

  // Server errors (500) — never say "Cloudinary" or "Firestore"
  if (status === 500) {
    return "Couldn't upload your photo. Please try again.";
  }

  // Unexpected
  return "Something went wrong. Please try again later.";
}


/* ════════════════════════════════════════════════════════
   استبدل handlePhotoSelected الموجودة بالكود ده
════════════════════════════════════════════════════════ */

function handlePhotoSelected(e) {
  const file = e.target.files?.[0];
  e.target.value = "";
  if (!file) return;

  // Client-side type check — same message as the server 400 "format" branch
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type)) {
    setUploadError("Only JPG, PNG, WEBP, or GIF images are supported.");
    return;
  }

  setUploadError("");

  // Measure the hero box so the crop matches the display exactly
  if (heroPhotoRef.current) {
    const r = heroPhotoRef.current.getBoundingClientRect();
    if (r.width && r.height) setCropAspect(r.width / r.height);
  }

  setCropSrc(URL.createObjectURL(file));
}


/* ════════════════════════════════════════════════════════
════════════════════════════════════════════════════════ */
function handleCropCancel() {
  if (cropSrc) URL.revokeObjectURL(cropSrc);
  setCropSrc(null);
}

async function handleCropConfirm(croppedDataUrl) {
  if (cropSrc) URL.revokeObjectURL(cropSrc);
  setCropSrc(null);

  setUploadError("");
  setUploadingPhoto(true);

  try {
    const idToken = await user.getIdToken();

    const resp = await fetch("/api/upload-profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ image: croppedDataUrl }),
    });

    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      // Map to a clean, non-leaky message — never expose Cloudinary / Firestore details
      setUploadError(mapUploadError(resp.status, data?.error));
      return;
    }

    setLocalImg(data.url);

  } catch {
    // Network failure or JSON parse error — nothing internal to leak
    setUploadError("Something went wrong. Please try again later.");
  } finally {
    setUploadingPhoto(false);
  }
}

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
  const isAdmin    = userData?.role === "admin";

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

  const TABS = [
    { key: "overview", icon: Icon.grid,  label: t("home")     },
    { key: "plan",     icon: Icon.plan,  label: t("myPlan")   },
    { key: "recipes",  icon: Icon.book,  label: t("recipes")  },
    { key: "progress", icon: Icon.chart, label: t("progress") },
  ];

  const PrefButtons = (
    <button className="up-pref-btn" onClick={toggleLang} title="Language">
      {Icon.globe}<span>{lang === "en" ? "AR" : "EN"}</span>
    </button>
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
            {PrefButtons}
            {isAdmin && (
              <button className="up-dash-btn" onClick={() => (window.location.href = "/admin")}>
                {Icon.tools} {t("dashboard")}
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
  const prevWeight = weights.length > 1 ? weights[weights.length - 2] : null;
  const initial    = userData?.name?.charAt(0).toUpperCase() || "U";
  const firstName  = userData?.name?.split(" ")[0] || "there";
  const profilePhoto = localImg || userData?.img || "/coach.png";

  const weeksSpan = weights.length >= 2
    ? Math.max(1, Math.round((new Date(weights[weights.length - 1].date) - new Date(weights[0].date)) / (7 * 24 * 3600 * 1000)))
    : 0;

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
        <button className="up-sidebar-btn" onClick={toggleLang} title="Language">{Icon.globe}</button>
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
            {PrefButtons}
            {isAdmin && (
              <button className="up-dash-btn" onClick={() => (window.location.href = "/admin")}>
                {Icon.tools} {t("dashboard")}
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

<div className="hero-photo" ref={heroPhotoRef}>
  <img src={profilePhoto} alt="" className="hero-photo-img" />

                <button
                  type="button"
                  className="hero-photo-edit-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  title="Change photo"
                >
                  {uploadingPhoto ? <span className="hpe-spinner" /> : Icon.camera}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelected}
                  style={{ display: "none" }}
                />

                <div className="hero-photo-content">
                  <div className="hero-greet">{t("welcomeBack")}</div>
                  <div className="hero-photo-name">{firstName} 👋</div>
                  <div className="hero-photo-line">{t("heroLine")}</div>
                  <div className="hero-photo-badges">
                    <span className="hero-badge active">⚡ {userData?.remainingSessions ?? 0} {t("sessionsLeft")}</span>
                    {userData?.goal && <span className="hero-badge goal">🎯 {userData.goal}</span>}
                  </div>
                </div>
              </div>

              {uploadError && <div className="hero-photo-error">{uploadError}</div>}

              <div className="stat-strip">
                <div className="stat-chip">
                  <div className="stat-chip-icon">⚖️</div>
                  <div className="stat-chip-val">{userData?.currentWeight ?? lastWeight?.weight ?? "—"}<span className="stat-chip-unit">kg</span></div>
                  <div className="stat-chip-lbl">{t("current")}</div>
                </div>
                <div className="stat-chip">
                  <div className="stat-chip-icon">🎯</div>
                  <div className="stat-chip-val">{userData?.targetWeight ?? "—"}<span className="stat-chip-unit">kg</span></div>
                  <div className="stat-chip-lbl">{t("target")}</div>
                </div>
                <div className="stat-chip">
                  <div className="stat-chip-icon">📏</div>
                  <div className="stat-chip-val">{userData?.height ?? "—"}<span className="stat-chip-unit">cm</span></div>
                  <div className="stat-chip-lbl">{t("height")}</div>
                </div>
                <div className="stat-chip">
                  <div className="stat-chip-icon">🔥</div>
                  <div className="stat-chip-val">{userData?.remainingSessions ?? "—"}</div>
                  <div className="stat-chip-lbl">{t("sessions")}</div>
                </div>
              </div>

              {weights.length >= 2 && (
                <div className="chart-card">
                  <WeightChart entries={weights}/>
                </div>
              )}

              <div className="details-grid">
                <div className="details-card">
                  <div className="dc-title">{t("profileDetails")}</div>
                  {[
                    [t("age"),            userData?.age           ? `${userData.age} ${t("yrs")}`    : "—"],
                    [t("height"),         userData?.height        ? `${userData.height} cm`          : "—"],
                    [t("currentWeight"),  userData?.currentWeight ? `${userData.currentWeight} kg`   : "—"],
                    [t("targetWeight"),   userData?.targetWeight  ? `${userData.targetWeight} kg`    : "—"],
                    [t("goal"),           userData?.goal          || "—"],
                    [t("sessionsLeftLbl"),userData?.remainingSessions ?? "—"],
                  ].map(([label, val]) => (
                    <div className="dc-row" key={label}>
                      <span className="dc-label">{label}</span>
                      <span className="dc-val">{val}</span>
                    </div>
                  ))}
                </div>

                {lastWeight && (
                  <div className="details-card">
                    <div className="dc-title">{t("latestMeasurement")}</div>
                    {[
                      [t("date"),     lastWeight.date],
                      [t("weight"),   lastWeight.weight  ? `${lastWeight.weight} kg`  : "—"],
                      [t("bmi"),      lastWeight.bmi     ? lastWeight.bmi             : "—"],
                      [t("bodyFat"),  lastWeight.bodyFat ? `${lastWeight.bodyFat}%`   : "—"],
                      [t("muscleMass"),lastWeight.muscle ? `${lastWeight.muscle}%`    : "—"],
                      [t("water"),    lastWeight.water   ? `${lastWeight.water}%`     : "—"],
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

          {/* ════════ PLAN ════════ */}
          {tab === "plan" && (
            <div className="up-tab-content">
              {!plan ? (
                <div className="empty-state">
                  <div className="es-icon">📋</div>
                  <div className="es-title">{t("noPlanYet")}</div>
                  <div className="es-sub">{t("noPlanSub")}</div>
                </div>
              ) : (
                <>
                  <div className="plan-header">
                    <div className="plan-header-title">{t("nutritionPlan")}</div>
                    {plan.updatedAt?.toDate && (
                      <div className="plan-updated">
                        {t("updated")} {plan.updatedAt.toDate().toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  <div className="plan-summary-bar">
                    <div className="psb-goal">
                      <div className="psb-icon">🎯</div>
                      <div>
                        <div className="psb-lbl">{plan.calorieTarget ? t("todaysGoal") : t("plannedToday")}</div>
                        <div className="psb-val">{plan.calorieTarget ?? planTotals.cal} kcal</div>
                      </div>
                    </div>
                    <div className="psb-metric"><span className="psb-mlbl">{t("protein")}</span><span className="psb-mval">{planTotals.prot}g</span></div>
                    <div className="psb-metric"><span className="psb-mlbl">{t("carbs")}</span><span className="psb-mval">{planTotals.carb}g</span></div>
                    <div className="psb-metric"><span className="psb-mlbl">{t("fats")}</span><span className="psb-mval">{planTotals.fat}g</span></div>
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
                        <div className="dt-lbl">{t("dailyTotal")}</div>
                        <div className="dt-val">{planTotals.cal} kcal</div>
                      </div>
                      <div className="dt-metric"><span className="dt-mlbl">{t("protein")}</span><span className="dt-mval">{planTotals.prot}g</span></div>
                      <div className="dt-metric"><span className="dt-mlbl">{t("carbs")}</span><span className="dt-mval">{planTotals.carb}g</span></div>
                      <div className="dt-metric"><span className="dt-mlbl">{t("fats")}</span><span className="dt-mval">{planTotals.fat}g</span></div>
                      {plan.calorieTarget && <ProgressRing percent={(planTotals.cal / plan.calorieTarget) * 100} />}
                    </div>
                  )}

                  {(plan.waterIntake || plan.cardio || plan.supplements || plan.generalNotes) && (
                    <div className="plan-extras">
                      {plan.waterIntake  && <div className="pe-item"><div className="pe-label">💧 {t("water")}</div><div className="pe-val">{plan.waterIntake}</div></div>}
                      {plan.cardio       && <div className="pe-item"><div className="pe-label">🏃 {t("cardio")}</div><div className="pe-val">{plan.cardio}</div></div>}
                      {plan.supplements  && <div className="pe-item"><div className="pe-label">💊 {t("supplements")}</div><div className="pe-val">{plan.supplements}</div></div>}
                      {plan.generalNotes && <div className="pe-item"><div className="pe-label">📌 {t("notes")}</div><div className="pe-val">{plan.generalNotes}</div></div>}
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
                  <div className="es-title">{t("noDataYet")}</div>
                  <div className="es-sub">{t("noDataSub")}</div>
                </div>
              ) : (
                <>
                  <div className="wp-card">
                    <div className="wp-card-header">
                      <div className="wp-card-title-wrap">
                        <span className="wp-card-icon">{Icon.chart}</span>
                        <div className="wp-card-title">{t("weightProgress")}</div>
                      </div>
                      {weeksSpan > 0 && (
                        <div className="wp-range-badge">{t("lastWeeks", { n: weeksSpan })}</div>
                      )}
                    </div>

                    {weights.length >= 2
                      ? <WeightChart entries={weights}/>
                      : <div className="wp-not-enough">Log at least 2 weigh-ins to see your progress.</div>}
                  </div>

                  <div className="wp-metrics-grid">
                    <MetricCard
                      icon="⚖️" cls="violet" label={t("currentWeight")}
                      value={lastWeight.weight} unit="kg"
                      delta={prevWeight ? +(lastWeight.weight - prevWeight.weight).toFixed(1) : null}
                    />
                    <MetricCard
                      icon="🔥" cls="coral" label={t("bodyFat")}
                      value={lastWeight.bodyFat ?? "—"} unit="%"
                      delta={prevWeight?.bodyFat && lastWeight.bodyFat ? +(lastWeight.bodyFat - prevWeight.bodyFat).toFixed(1) : null}
                    />
                    <MetricCard
                      icon="📐" cls="blue" label={t("bmi")}
                      value={lastWeight.bmi ?? "—"} unit=""
                    />
                    <MetricCard
                      icon="💪" cls="green" label={t("muscleMass")}
                      value={lastWeight.muscle ?? "—"} unit="kg"
                      delta={prevWeight?.muscle && lastWeight.muscle ? +(lastWeight.muscle - prevWeight.muscle).toFixed(1) : null}
                    />
                  </div>

                  <div className="wp-note">
                    <span>ⓘ</span> {t("allMeasurementsNote")}
                  </div>

                  <button className="history-toggle" onClick={() => setShowHistory(h => !h)}>
                    <span>⚖️ {t("weightHistory")}</span>
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

   {cropSrc && (
  <PhotoCropModal
    src={cropSrc}
    aspect={cropAspect}
    onCancel={handleCropCancel}
    onConfirm={handleCropConfirm}
  />
)}
    </div>
  );
}