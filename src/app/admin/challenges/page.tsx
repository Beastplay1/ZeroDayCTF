"use client";
import { useState, useEffect, useCallback } from "react";
import { Orbitron } from "next/font/google";

const orbitron = Orbitron({ subsets: ["latin"] });

interface ChallengeDoc {
  _id: string;
  name: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Insane";
  points: number;
  description: string;
  flag: string;
  file?: string;
  type: "weekly" | "daily";
  active: boolean;
  solves: number;
  firstBlood?: string;
  createdAt: string;
  expiresAt?: string;
}

const EMPTY_FORM = {
  name: "",
  category: "Crypto",
  difficulty: "Easy" as const,
  points: 50,
  description: "",
  flag: "",
  file: "",
  type: "weekly" as const,
  active: true,
};

const CATEGORIES = [
  "Web",
  "Crypto",
  "Pwn",
  "Reverse Engineering",
  "Forensics",
  "Binary",
  "OSINT",
  "Misc",
];
const DIFFICULTIES = ["Easy", "Medium", "Hard", "Insane"] as const;

const categoryColors: Record<string, string> = {
  Web: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  Crypto: "bg-purple-500/20 text-purple-400 border-purple-500/50",
  Pwn: "bg-red-500/20 text-red-400 border-red-500/50",
  "Reverse Engineering": "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  Forensics: "bg-green-500/20 text-green-400 border-green-500/50",
  Binary: "bg-orange-500/20 text-orange-400 border-orange-500/50",
  OSINT: "bg-indigo-500/20 text-indigo-400 border-indigo-500/50",
  Misc: "bg-gray-500/20 text-gray-400 border-gray-500/50",
};

export default function AdminChallengesPage() {
  const [challenges, setChallenges] = useState<ChallengeDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/challenges");
    const data = await res.json();
    setChallenges(data.challenges ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError("");
    setShowForm(true);
  };

  const openEdit = (c: ChallengeDoc) => {
    setForm({
      name: c.name,
      category: c.category,
      difficulty: c.difficulty as typeof EMPTY_FORM.difficulty,
      points: c.points,
      description: c.description,
      flag: c.flag,
      file: c.file ?? "",
      type: c.type as typeof EMPTY_FORM.type,
      active: c.active,
    });
    setEditingId(c._id);
    setError("");
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const body = { ...form, file: form.file || undefined };

    const res = editingId
      ? await fetch(`/api/admin/challenges/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      : await fetch("/api/admin/challenges", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Something went wrong");
      setSaving(false);
      return;
    }

    setSaving(false);
    setShowForm(false);
    load();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/challenges/${id}`, { method: "DELETE" });
    setDeleteConfirm(null);
    load();
  };

  const toggleActive = async (c: ChallengeDoc) => {
    await fetch(`/api/admin/challenges/${c._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !c.active }),
    });
    load();
  };

  const diffColor: Record<string, string> = {
    Easy: "text-green-400",
    Medium: "text-yellow-400",
    Hard: "text-orange-400",
    Insane: "text-red-400",
  };

  const ChallengeTimer = ({ expiresAt }: { expiresAt?: string }) => {
    const [timeLeft, setTimeLeft] = useState<string>("");

    useEffect(() => {
      if (!expiresAt) return;
      const interval = setInterval(() => {
        const diff = new Date(expiresAt).getTime() - new Date().getTime();
        if (diff <= 0) {
          setTimeLeft("Expired");
          clearInterval(interval);
          return;
        }
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / 1000 / 60) % 60);
        const s = Math.floor((diff / 1000) % 60);
        setTimeLeft(`${d > 0 ? d + "d " : ""}${h}h ${m}m ${s}s`);
      }, 1000);
      return () => clearInterval(interval);
    }, [expiresAt]);

    if (!expiresAt || !timeLeft) return null;

    return (
      <span className="font-mono text-xs px-2 py-0.5 border border-yellow-700/50 bg-black/40 text-gray-300 rounded flex items-center gap-1">
        <span className="text-yellow-500">⏱</span> {timeLeft}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-black text-green-400 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <a
              href="/"
              className="text-green-700 font-mono text-xs hover:text-green-400 transition-colors"
            >
              ← Back to dashboard
            </a>
            <h1
              className={`${orbitron.className} text-3xl font-bold text-green-400 mt-1`}
            >
              Challenges
            </h1>
          </div>
          <button
            onClick={openAdd}
            className="px-4 py-2 border border-green-500 text-green-400 font-mono text-sm hover:bg-green-500 hover:text-black transition-all duration-200"
          >
            + Add Challenge
          </button>
        </div>

        {/* List */}
        {loading ? (
          <p className="font-mono text-green-700 text-sm">Loading...</p>
        ) : challenges.length === 0 ? (
          <div className="border border-green-900 p-12 text-center text-green-700 font-mono text-sm">
            No challenges yet. Add one.
          </div>
        ) : (
          <div className="space-y-3">
            {challenges.map((c) => (
              <div
                key={c._id}
                className="border border-green-900 bg-green-950/10 p-4 flex items-start justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span
                      className={`${orbitron.className} text-white font-semibold`}
                    >
                      {c.name}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 border ${categoryColors[c.category] || categoryColors.Misc} font-bold font-mono`}
                    >
                      {c.category}
                    </span>
                    <span
                      className={`font-mono text-xs font-bold ${diffColor[c.difficulty]}`}
                    >
                      {c.difficulty}
                    </span>
                    <span className="text-green-400 font-mono text-xs">
                      {c.points}pts
                    </span>
                    <span
                      className={`font-mono text-xs px-2 py-0.5 border ${c.type === "weekly" ? "border-cyan-800 text-cyan-500" : "border-purple-800 text-purple-400"}`}
                    >
                      {c.type}
                    </span>
                    <span
                      className={`font-mono text-xs px-2 py-0.5 border ${c.active ? "border-green-700 text-green-500" : "border-red-900 text-red-600"}`}
                    >
                      {c.active ? "active" : "inactive"}
                    </span>
                    <ChallengeTimer expiresAt={c.expiresAt} />
                  </div>
                  <p className="text-green-700 font-mono text-xs mt-1 truncate">
                    {c.description}
                  </p>
                  <p className="text-green-900 font-mono text-xs mt-0.5">
                    flag: <span className="text-green-600">{c.flag}</span>
                    {c.file && <span className="ml-3">file: {c.file}</span>}
                    <span className="ml-3">solves: {c.solves}</span>
                    {c.firstBlood && (
                      <span className="ml-3 text-red-500">
                        🩸 {c.firstBlood}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleActive(c)}
                    className="px-2 py-1 border border-green-900 text-green-700 font-mono text-xs hover:border-green-500 hover:text-green-400 transition-colors"
                  >
                    {c.active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => openEdit(c)}
                    className="px-2 py-1 border border-green-900 text-green-700 font-mono text-xs hover:border-green-500 hover:text-green-400 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(c._id)}
                    className="px-2 py-1 border border-red-900 text-red-700 font-mono text-xs hover:border-red-500 hover:text-red-400 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {showForm && (
          <div
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setShowForm(false)}
          >
            <div
              className="bg-black border border-green-800 w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-green-900 flex justify-between items-center">
                <h2 className={`${orbitron.className} text-lg text-green-400`}>
                  {editingId ? "Edit Challenge" : "Add Challenge"}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-green-700 hover:text-white text-2xl leading-none"
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {error && (
                  <p className="text-red-400 font-mono text-xs">✗ {error}</p>
                )}

                <Field label="Name">
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="input-admin"
                    placeholder="Challenge Name"
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Category">
                    <select
                      value={form.category}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                      }
                      className="input-admin"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Difficulty">
                    <select
                      value={form.difficulty}
                      onChange={(e) =>
                        setForm({ ...form, difficulty: e.target.value as any })
                      }
                      className="input-admin"
                    >
                      {DIFFICULTIES.map((d) => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Points">
                    <input
                      type="number"
                      value={form.points}
                      min={1}
                      onChange={(e) =>
                        setForm({ ...form, points: Number(e.target.value) })
                      }
                      required
                      className="input-admin"
                    />
                  </Field>
                  <Field label="Type">
                    <select
                      value={form.type}
                      onChange={(e) =>
                        setForm({ ...form, type: e.target.value as any })
                      }
                      className="input-admin"
                    >
                      <option value="weekly">Weekly (7-day)</option>
                      <option value="daily">Daily (24h)</option>
                    </select>
                  </Field>
                </div>

                <Field label="Description">
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    required
                    rows={2}
                    className="input-admin resize-none"
                    placeholder="Can you solve the system?"
                  />
                </Field>

                <Field label="Flag">
                  <input
                    value={form.flag}
                    onChange={(e) => setForm({ ...form, flag: e.target.value })}
                    required
                    className="input-admin font-mono"
                    placeholder="ctf{...}"
                  />
                </Field>

                <Field label="File (optional)">
                  <input
                    value={form.file}
                    onChange={(e) => setForm({ ...form, file: e.target.value })}
                    className="input-admin"
                    placeholder="file.zip"
                  />
                </Field>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={form.active}
                    onChange={(e) =>
                      setForm({ ...form, active: e.target.checked })
                    }
                    className="accent-green-500"
                  />
                  <label
                    htmlFor="active"
                    className="font-mono text-sm text-green-600"
                  >
                    Active (visible to players)
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-2 border border-green-500 text-green-400 font-mono text-sm hover:bg-green-500 hover:text-black transition-all duration-200 disabled:opacity-50"
                  >
                    {saving
                      ? "Saving..."
                      : editingId
                        ? "Save Changes"
                        : "Create Challenge"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-green-900 text-green-700 font-mono text-sm hover:border-green-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirm */}
        {deleteConfirm && (
          <div
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <div
              className="bg-black border border-red-800 p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="font-mono text-red-400 mb-4">
                Delete this challenge? This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 py-2 border border-red-600 text-red-400 font-mono text-sm hover:bg-red-600 hover:text-black transition-all"
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2 border border-green-900 text-green-700 font-mono text-sm hover:border-green-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .input-admin {
          width: 100%;
          background: #000;
          border: 1px solid #14532d;
          color: #86efac;
          padding: 6px 10px;
          font-family: monospace;
          font-size: 13px;
          outline: none;
          transition: border-color 0.15s;
        }
        .input-admin:focus {
          border-color: #22c55e;
        }
        .input-admin option {
          background: #000;
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block font-mono text-xs text-green-700 mb-1 uppercase tracking-widest">
        {label}
      </label>
      {children}
    </div>
  );
}
