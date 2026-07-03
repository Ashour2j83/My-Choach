import { useState } from "react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

// Fields editable in the profile editor. updateDoc() will create any of
// these keys on the document if they don't already exist — Firestore
// merges individual fields on update rather than requiring the doc to
// already contain them.
const emptyForm = {
  fullName: "",
  email: "",
  age: "",
  height: "",
  currentWeight: "",
  targetWeight: "",
  goal: "",
  remainingSessions: "",
  status: "active",
};

export default function UserEditorModal({ user, onClose, onSaved }) {
  const [form, setForm] = useState({
    fullName: user.fullName ?? "",
    email: user.email ?? "",
    age: user.age ?? "",
    height: user.height ?? "",
    currentWeight: user.currentWeight ?? "",
    targetWeight: user.targetWeight ?? "",
    goal: user.goal ?? "",
    remainingSessions: user.remainingSessions ?? "",
    status: user.status ?? "active",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const setField = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, {
        fullName: form.fullName,
        email: form.email,
        age: form.age === "" ? null : Number(form.age),
        height: form.height === "" ? null : Number(form.height),
        currentWeight: form.currentWeight === "" ? null : Number(form.currentWeight),
        targetWeight: form.targetWeight === "" ? null : Number(form.targetWeight),
        goal: form.goal,
        remainingSessions:
          form.remainingSessions === "" ? 0 : Number(form.remainingSessions),
        status: form.status,
        updatedAt: serverTimestamp(),
      });
      onSaved?.({ id: user.id, ...form });
      onClose();
    } catch (err) {
      console.error(err);
      setError("Couldn't save changes. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">Edit client profile</div>
            <div className="modal-sub">UID: {user.id}</div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="form-section-title">👤 Basic info</div>
          <div className="form-grid">
            <div className="field span-2">
              <label className="field-label">Full name</label>
              <input
                className="field-input"
                value={form.fullName}
                onChange={setField("fullName")}
                placeholder="e.g. Ahmed Ali"
              />
            </div>
            <div className="field span-2">
              <label className="field-label">Email</label>
              <input
                className="field-input"
                type="email"
                value={form.email}
                onChange={setField("email")}
                placeholder="client@email.com"
              />
            </div>
          </div>

          <div className="form-section-title">📏 Body metrics</div>
          <div className="form-grid">
            <div className="field">
              <label className="field-label">Age</label>
              <input
                className="field-input"
                type="number"
                value={form.age}
                onChange={setField("age")}
              />
            </div>
            <div className="field">
              <label className="field-label">Height (cm)</label>
              <input
                className="field-input"
                type="number"
                value={form.height}
                onChange={setField("height")}
              />
            </div>
            <div className="field">
              <label className="field-label">Current weight (kg)</label>
              <input
                className="field-input"
                type="number"
                value={form.currentWeight}
                onChange={setField("currentWeight")}
              />
            </div>
            <div className="field">
              <label className="field-label">Target weight (kg)</label>
              <input
                className="field-input"
                type="number"
                value={form.targetWeight}
                onChange={setField("targetWeight")}
              />
            </div>
            <div className="field span-2">
              <label className="field-label">Goal</label>
              <input
                className="field-input"
                value={form.goal}
                onChange={setField("goal")}
                placeholder="e.g. Weight loss, muscle gain, endurance"
              />
            </div>
          </div>

          <div className="form-section-title">📋 Coaching status</div>
          <div className="form-grid">
            <div className="field">
              <label className="field-label">Remaining sessions</label>
              <input
                className="field-input"
                type="number"
                value={form.remainingSessions}
                onChange={setField("remainingSessions")}
              />
            </div>
            <div className="field">
              <label className="field-label">Status</label>
              <div className="toggle-row">
                <button
                  type="button"
                  className={`toggle-pill ${form.status === "active" ? "on active" : ""}`}
                  onClick={() => setForm((f) => ({ ...f, status: "active" }))}
                >
                  Active
                </button>
                <button
                  type="button"
                  className={`toggle-pill ${form.status === "inactive" ? "on inactive" : ""}`}
                  onClick={() => setForm((f) => ({ ...f, status: "inactive" }))}
                >
                  Inactive
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div style={{ color: "var(--coral)", fontSize: 12.5, marginTop: 14 }}>
              {error}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export { emptyForm as emptyUserForm };