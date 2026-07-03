import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";

const MEALS = [
  { key: "breakfast", label: "Breakfast", icon: "🍳" },
  { key: "snack1", label: "Snack 1", icon: "🍎" },
  { key: "lunch", label: "Lunch", icon: "🍗" },
  { key: "snack2", label: "Snack 2", icon: "🥜" },
  { key: "dinner", label: "Dinner", icon: "🥗" },
];

const emptyPlan = {
  breakfast: [],
  snack1: [],
  lunch: [],
  snack2: [],
  dinner: [],
  waterIntake: "",
  supplements: "",
  cardio: "",
  generalNotes: "",
};

let itemIdCounter = 0;
const newItemId = () => `item_${Date.now()}_${itemIdCounter++}`;

export default function PlanEditorModal({ user, onClose }) {
  const [plan, setPlan] = useState(emptyPlan);
  const [docExists, setDocExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedFlash, setSavedFlash] = useState(false);

  // Load plan doc where the document ID equals the selected user's UID.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const planRef = doc(db, "plans", user.id);
        const snap = await getDoc(planRef);
        if (cancelled) return;
        if (snap.exists()) {
          const data = snap.data();
          setDocExists(true);
          setPlan({
            breakfast: withRowIds(data.breakfast),
            snack1: withRowIds(data.snack1),
            lunch: withRowIds(data.lunch),
            snack2: withRowIds(data.snack2),
            dinner: withRowIds(data.dinner),
            waterIntake: data.waterIntake ?? "",
            supplements: data.supplements ?? "",
            cardio: data.cardio ?? "",
            generalNotes: data.generalNotes ?? "",
          });
        } else {
          setDocExists(false);
          setPlan(emptyPlan);
        }
      } catch (err) {
        console.error(err);
        setError("Couldn't load this client's plan.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  function withRowIds(arr) {
    if (!Array.isArray(arr)) return [];
    return arr.map((item) => ({ _rowId: newItemId(), ...item }));
  }

  function addItem(mealKey) {
    setPlan((p) => ({
      ...p,
      [mealKey]: [
        ...p[mealKey],
        { _rowId: newItemId(), food: "", quantity: "", notes: "" },
      ],
    }));
  }

  function removeItem(mealKey, rowId) {
    setPlan((p) => ({
      ...p,
      [mealKey]: p[mealKey].filter((it) => it._rowId !== rowId),
    }));
  }

  function updateItem(mealKey, rowId, field, value) {
    setPlan((p) => ({
      ...p,
      [mealKey]: p[mealKey].map((it) =>
        it._rowId === rowId ? { ...it, [field]: value } : it
      ),
    }));
  }

  function updateField(field, value) {
    setPlan((p) => ({ ...p, [field]: value }));
  }

  function stripRowIds(arr) {
    return arr.map(({ _rowId, ...rest }) => rest);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const planRef = doc(db, "plans", user.id);
      const payload = {
        breakfast: stripRowIds(plan.breakfast),
        snack1: stripRowIds(plan.snack1),
        lunch: stripRowIds(plan.lunch),
        snack2: stripRowIds(plan.snack2),
        dinner: stripRowIds(plan.dinner),
        waterIntake: plan.waterIntake,
        supplements: plan.supplements,
        cardio: plan.cardio,
        generalNotes: plan.generalNotes,
        updatedAt: serverTimestamp(),
      };

      if (docExists) {
        // Document already exists for this UID — update in place.
        await updateDoc(planRef, payload);
      } else {
        // No plan yet for this user — create it, with doc ID == user UID.
        // Never use addDoc()/auto-id here, or a duplicate plan could be
        // created for a user who already has one.
        await setDoc(planRef, payload);
        setDocExists(true);
      }

      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1800);
    } catch (err) {
      console.error(err);
      setError("Couldn't save the plan. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">🥗 {user.fullName || "Client"}'s nutrition plan</div>
            <div className="modal-sub">
              plans/{user.id} {docExists ? "· existing document" : "· not yet created"}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="loading-row">Loading plan…</div>
          ) : (
            <>
              {MEALS.map((meal) => (
                <div className="meal-block" key={meal.key}>
                  <div className="meal-block-header">
                    <div className="meal-block-title">
                      {meal.icon} {meal.label}
                      <span className="meal-count">{plan[meal.key].length}</span>
                    </div>
                    <button
                      className="btn-add-item"
                      onClick={() => addItem(meal.key)}
                      type="button"
                    >
                      + Add food
                    </button>
                  </div>
                  <div className="meal-items">
                    {plan[meal.key].length === 0 && (
                      <div className="meal-empty">No items yet</div>
                    )}
                    {plan[meal.key].map((item) => (
                      <div className="meal-item-row" key={item._rowId}>
                        <input
                          placeholder="Food"
                          value={item.food}
                          onChange={(e) =>
                            updateItem(meal.key, item._rowId, "food", e.target.value)
                          }
                        />
                        <input
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(meal.key, item._rowId, "quantity", e.target.value)
                          }
                        />
                        <input
                          placeholder="Notes"
                          value={item.notes}
                          onChange={(e) =>
                            updateItem(meal.key, item._rowId, "notes", e.target.value)
                          }
                        />
                        <button
                          type="button"
                          className="btn-remove-item"
                          onClick={() => removeItem(meal.key, item._rowId)}
                          title="Remove item"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="form-section-title">💧 Other plan details</div>
              <div className="form-grid">
                <div className="field">
                  <label className="field-label">Water intake</label>
                  <input
                    className="field-input"
                    placeholder="e.g. 3 liters/day"
                    value={plan.waterIntake}
                    onChange={(e) => updateField("waterIntake", e.target.value)}
                  />
                </div>
                <div className="field">
                  <label className="field-label">Cardio</label>
                  <input
                    className="field-input"
                    placeholder="e.g. 30 min incline walk, 4x/week"
                    value={plan.cardio}
                    onChange={(e) => updateField("cardio", e.target.value)}
                  />
                </div>
                <div className="field span-2">
                  <label className="field-label">Supplements</label>
                  <input
                    className="field-input"
                    placeholder="e.g. Whey protein, creatine, multivitamin"
                    value={plan.supplements}
                    onChange={(e) => updateField("supplements", e.target.value)}
                  />
                </div>
                <div className="field span-2">
                  <label className="field-label">General notes</label>
                  <textarea
                    className="field-textarea"
                    value={plan.generalNotes}
                    onChange={(e) => updateField("generalNotes", e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          {error && (
            <div style={{ color: "var(--coral)", fontSize: 12.5, marginTop: 14 }}>
              {error}
            </div>
          )}
        </div>

        <div className="modal-footer">
          {savedFlash && (
            <div className="save-status">
              <span className="pulse-dot" /> Saved
            </div>
          )}
          <button className="btn-secondary" onClick={onClose} disabled={saving}>
            Close
          </button>
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={saving || loading}
          >
            {saving ? "Saving…" : docExists ? "Update plan" : "Create plan"}
          </button>
        </div>
      </div>
    </div>
  );
}