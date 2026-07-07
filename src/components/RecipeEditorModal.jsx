import { useState, useEffect } from "react";
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  onSnapshot, serverTimestamp, query, orderBy,
} from "firebase/firestore";
import { db } from "../firebase/config";

const MEAL_TYPES = ["Breakfast","Snack","Lunch","Dinner","Pre-workout","Post-workout","Anytime"];

// ── RECIPE EDITOR MODAL ───────────────────────────────────────────────────────
export function RecipeEditorModal({ recipe, onClose }) {
  const isNew = !recipe?.id;

  const [form, setForm] = useState({
    name:        recipe?.name        || "",
    description: recipe?.description || "",
    mealType:    recipe?.mealType    || "Anytime",
    image:       recipe?.image       || "",
    calories:    recipe?.calories    || "",
    protein:     recipe?.protein     || "",
    carbs:       recipe?.carbs       || "",
    fat:         recipe?.fat         || "",
    ingredients: recipe?.ingredients || "",
  });

  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [deleting,setDeleting]= useState(false);

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

  async function handleSave() {
    if (!form.name.trim()) return;
    try {
      setSaving(true);
      const payload = { ...form, updatedAt: serverTimestamp() };
      if (isNew) {
        await addDoc(collection(db, "Recipes"), { ...payload, createdAt: serverTimestamp() });
      } else {
        await updateDoc(doc(db, "Recipes", recipe.id), payload);
      }
      setSaved(true);
      setTimeout(() => { setSaved(false); if (isNew) onClose(); }, 1200);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!recipe?.id) return;
    if (!confirm(`Delete "${recipe.name}"?`)) return;
    try {
      setDeleting(true);
      await deleteDoc(doc(db, "Recipes", recipe.id));
      onClose();
    } catch (e) {
      console.error(e);
      setDeleting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-header">
          <div>
            <div className="modal-title">{isNew ? "New Recipe" : `Edit — ${recipe.name}`}</div>
            <div className="modal-sub">Recipes · {isNew ? "new document" : `id: ${recipe.id}`}</div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Image preview */}
          {form.image && (
            <div style={{ marginBottom: 16, borderRadius: 12, overflow: "hidden", height: 180 }}>
              <img
                src={form.image}
                alt="preview"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={e => e.target.style.display = "none"}
              />
            </div>
          )}

          <div className="form-section-title">📋 Basic Info</div>

          <div className="form-grid" style={{ marginBottom: 14 }}>
            <div className="field span-2">
              <label className="field-label">Recipe Name *</label>
              <input className="field-input" placeholder="e.g. Grilled Chicken Salad" value={form.name} onChange={e => set("name", e.target.value)} />
            </div>

            <div className="field">
              <label className="field-label">Meal Type</label>
              <select className="field-select field-input" value={form.mealType} onChange={e => set("mealType", e.target.value)}>
                {MEAL_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div className="field">
              <label className="field-label">Image URL</label>
              <input className="field-input" placeholder="https://..." value={form.image} onChange={e => set("image", e.target.value)} />
            </div>

            <div className="field span-2">
              <label className="field-label">Description</label>
              <textarea className="field-textarea" placeholder="Short description..." value={form.description} onChange={e => set("description", e.target.value)} />
            </div>
          </div>

          <div className="form-section-title">📊 Macros</div>

          <div className="form-grid" style={{ gridTemplateColumns: "repeat(4,1fr)", marginBottom: 14 }}>
            {[
              { key:"calories", label:"Calories (kcal)", cls:"amber" },
              { key:"protein",  label:"Protein (g)",     cls:"teal"  },
              { key:"carbs",    label:"Carbs (g)",        cls:"violet"},
              { key:"fat",      label:"Fat (g)",          cls:"coral" },
            ].map(m => (
              <div className="field" key={m.key}>
                <label className="field-label" style={{ color: `var(--${m.cls})` }}>{m.label}</label>
                <input className="field-input" type="number" min="0" placeholder="0" value={form[m.key]} onChange={e => set(m.key, e.target.value)} />
              </div>
            ))}
          </div>

          <div className="form-section-title">🧾 Ingredients</div>
          <div className="field" style={{ marginBottom: 4 }}>
            <label className="field-label">Ingredients (one per line or comma separated)</label>
            <textarea
              className="field-textarea"
              rows={5}
              placeholder={"100g oats\n2 eggs\n1 banana\n200ml milk"}
              value={form.ingredients}
              onChange={e => set("ingredients", e.target.value)}
            />
          </div>
        </div>

        <div className="modal-footer">
          {!isNew && (
            <button
              className="btn-sm"
              style={{ marginRight: "auto", color: "var(--coral)", borderColor: "var(--coral)", background: "var(--coral-soft)" }}
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "🗑 Delete"}
            </button>
          )}
          {saved && <span className="save-status"><span className="pulse-dot"/>Saved!</span>}
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving || !form.name.trim()}>
            {saving ? "Saving…" : isNew ? "Add Recipe" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── RECIPES VIEW (inside AdminPage) ──────────────────────────────────────────
const MEAL_TYPE_FILTER = ["All", ...MEAL_TYPES];

export default function RecipesView({ onEdit }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState("All");

  useEffect(() => {
    const q = query(collection(db, "Recipes"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, snap => {
      setRecipes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, err => { console.error(err); setLoading(false); });
    return () => unsub();
  }, []);

  const filtered = recipes.filter(r => {
    const matchSearch = !search.trim() ||
      (r.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.description || "").toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || r.mealType === filter;
    return matchSearch && matchFilter;
  });

  if (loading) return <div className="dash-card"><div className="loading-row">Loading recipes…</div></div>;

  return (
    <div className="dash-card">
      <div className="recipes-header-bar">
        <div className="card-title">📖 Recipes ({filtered.length})</div>
        <div className="recipes-search">
          <input
            className="field-input"
            style={{ width: 200 }}
            placeholder="Search recipes…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="field-input field-select"
            style={{ width: 140 }}
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            {MEAL_TYPE_FILTER.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📖</div>
          {recipes.length === 0 ? "No recipes yet. Click \"Add Recipe\" to add one." : "No results match your search."}
        </div>
      ) : (
        <div className="recipes-grid">
          {filtered.map(recipe => (
            <div className="recipe-card" key={recipe.id} onClick={() => onEdit(recipe)}>
              <div className="recipe-card-img">
                {recipe.image
                  ? <img src={recipe.image} alt={recipe.name} onError={e => { e.target.style.display="none"; e.target.parentNode.textContent="🍽️"; }}/>
                  : "🍽️"
                }
              </div>
              <div className="recipe-card-body">
                {recipe.mealType && (
                  <div className="recipe-card-meal">{recipe.mealType}</div>
                )}
                <div className="recipe-card-name">{recipe.name || "Untitled"}</div>
                {recipe.description && (
                  <div className="recipe-card-desc">{recipe.description}</div>
                )}
                <div className="recipe-card-macros">
                  {recipe.calories && <span className="recipe-macro-chip cal">{recipe.calories} kcal</span>}
                  {recipe.protein  && <span className="recipe-macro-chip prot">P {recipe.protein}g</span>}
                  {recipe.carbs    && <span className="recipe-macro-chip carb">C {recipe.carbs}g</span>}
                  {recipe.fat      && <span className="recipe-macro-chip fat">F {recipe.fat}g</span>}
                </div>
              </div>
              <div className="recipe-card-footer">
                <button className="btn-sm" onClick={e => { e.stopPropagation(); onEdit(recipe); }}>Edit</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}