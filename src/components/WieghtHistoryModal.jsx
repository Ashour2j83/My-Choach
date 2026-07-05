import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config.js";

// weightHistory is a top-level collection (NOT a subcollection).
// Each document has its own auto-generated ID and carries a "userId"
// field pointing back to users/{uid}. We query by that field to get
// one client's full history, newest first.

const FIELDS = [
  { key: "weight", label: "Weight (kg)" },
  { key: "bmi", label: "BMI" },
  { key: "bodyFat", label: "Body fat %" },
  { key: "muscle", label: "Muscle %" },
  { key: "water", label: "Water %" },
];

const emptyEntry = {
  date: new Date().toISOString().slice(0, 10),
  weight: "",
  bmi: "",
  bodyFat: "",
  muscle: "",
  water: "",
  notes: "",
};

export default function WeightHistoryModal({ user, onClose }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null); // entry id currently saving, or "new"
  const [draft, setDraft] = useState(null); // new entry being composed

  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, "weightHistory"),
      where("userId", "==", user.id),
      orderBy("date", "desc")
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setEntries(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError(
          "Couldn't load weight history. If this is the first time, Firestore may ask you to create an index — check the browser console for a link."
        );
        setLoading(false);
      }
    );
    return () => unsub();
  }, [user.id]);

  function updateLocalEntry(id, field, value) {
    setEntries((rows) =>
      rows.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  }

  async function saveEntry(entry) {
    setSavingId(entry.id);
    try {
      const { id, ...data } = entry;
      await updateDoc(doc(db, "weightHistory", id), {
        ...data,
        userId: user.id,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error(err);
      setError("Couldn't save that entry.");
    } finally {
      setSavingId(null);
    }
  }

  async function removeEntry(id) {
    setSavingId(id);
    try {
      await deleteDoc(doc(db, "weightHistory", id));
    } catch (err) {
      console.error(err);
      setError("Couldn't remove that entry.");
    } finally {
      setSavingId(null);
    }
  }

  async function saveNewEntry() {
    if (!draft) return;
    setSavingId("new");
    try {
      await addDoc(collection(db, "weightHistory"), {
        ...draft,
        userId: user.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setDraft(null);
    } catch (err) {
      console.error(err);
      setError("Couldn't add the new entry.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">⚖️ {user.name || "Client"}'s weight history</div>
            <div className="modal-sub">
              weightHistory · {entries.length} entr{entries.length === 1 ? "y" : "ies"} · userId = {user.id}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="loading-row">Loading history…</div>
          ) : (
            <>
              {entries.length === 0 && !draft && (
                <div className="empty-state">
                  <div className="empty-state-icon">⚖️</div>
                  No entries yet for this client.
                </div>
              )}

              {entries.map((entry) => (
                <div className="weight-entry-card" key={entry.id}>
                  <div className="weight-entry-header">
                    <input
                      className="weight-entry-date"
                      style={{
                        background: "transparent",
                        border: "none",
                        width: 120,
                      }}
                      type="date"
                      value={entry.date || ""}
                      onChange={(e) =>
                        updateLocalEntry(entry.id, "date", e.target.value)
                      }
                    />
                    <button
                      className="btn-remove-entry"
                      onClick={() => removeEntry(entry.id)}
                      disabled={savingId === entry.id}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="weight-entry-body">
                    <div className="weight-entry-grid">
                      {FIELDS.map((f) => (
                        <div className="field" key={f.key}>
                          <label className="field-label">{f.label}</label>
                          <input
                            className="field-input"
                            value={entry[f.key] ?? ""}
                            onChange={(e) =>
                              updateLocalEntry(entry.id, f.key, e.target.value)
                            }
                          />
                        </div>
                      ))}
                    </div>
                    <div className="field">
                      <label className="field-label">Notes</label>
                      <input
                        className="field-input"
                        value={entry.notes ?? ""}
                        onChange={(e) =>
                          updateLocalEntry(entry.id, "notes", e.target.value)
                        }
                      />
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                      <button
                        className="btn-primary"
                        onClick={() => saveEntry(entry)}
                        disabled={savingId === entry.id}
                      >
                        {savingId === entry.id ? "Saving…" : "Save entry"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {draft && (
                <div className="weight-entry-card" style={{ borderColor: "var(--teal)" }}>
                  <div className="weight-entry-header">
                    <input
                      className="weight-entry-date"
                      style={{ background: "transparent", border: "none", width: 120 }}
                      type="date"
                      value={draft.date}
                      onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
                    />
                    <button
                      className="btn-remove-entry"
                      onClick={() => setDraft(null)}
                    >
                      Discard
                    </button>
                  </div>
                  <div className="weight-entry-body">
                    <div className="weight-entry-grid">
                      {FIELDS.map((f) => (
                        <div className="field" key={f.key}>
                          <label className="field-label">{f.label}</label>
                          <input
                            className="field-input"
                            value={draft[f.key]}
                            onChange={(e) =>
                              setDraft((d) => ({ ...d, [f.key]: e.target.value }))
                            }
                          />
                        </div>
                      ))}
                    </div>
                    <div className="field">
                      <label className="field-label">Notes</label>
                      <input
                        className="field-input"
                        value={draft.notes}
                        onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
                      />
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                      <button
                        className="btn-primary"
                        onClick={saveNewEntry}
                        disabled={savingId === "new"}
                      >
                        {savingId === "new" ? "Adding…" : "Add entry"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {!draft && (
                <button
                  className="btn-add-entry"
                  onClick={() => setDraft({ ...emptyEntry })}
                >
                  + Add new weekly entry
                </button>
              )}
            </>
          )}

          {error && (
            <div style={{ color: "var(--coral)", fontSize: 12.5, marginTop: 14 }}>
              {error}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
