import { useState } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config.js";

// Creates a new document in "users". In production this normally runs
// right after Firebase Auth creates the account, using the returned
// user.uid as the document ID so users/{uid} and auth stay in sync.
// Here we accept a UID field directly so the admin can paste the UID
// from Firebase Auth (or leave blank to auto-generate one for testing).

export default function AddClientModal({ onClose, onCreated }) {
  const [uid, setUid] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [goal, setGoal] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const id = uid.trim() || crypto.randomUUID();
      const userRef = doc(db, "users", id);
      await setDoc(userRef, {
        name,
        email,
        goal,
        status: "active",
        remainingSessions: 0,
        age: null,
        height: null,
        currentWeight: null,
        targetWeight: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      onCreated?.(id);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Couldn't create the client. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">+ Add client</div>
            <div className="modal-sub">Creates a document in the "users" collection</div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="form-grid single">
            <div className="field">
              <label className="field-label">Firebase Auth UID (optional)</label>
              <input
                className="field-input"
                value={uid}
                onChange={(e) => setUid(e.target.value)}
                placeholder="Leave blank to auto-generate for testing"
              />
            </div>
            <div className="field">
              <label className="field-label">Name</label>
              <input
                className="field-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Laila Adel"
              />
            </div>
            <div className="field">
              <label className="field-label">Email</label>
              <input
                className="field-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@email.com"
              />
            </div>
            <div className="field">
              <label className="field-label">Goal</label>
              <input
                className="field-input"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. Weight loss"
              />
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
          <button className="btn-primary" onClick={handleCreate} disabled={saving}>
            {saving ? "Creating…" : "Create client"}
          </button>
        </div>
      </div>
    </div>
  );
}
