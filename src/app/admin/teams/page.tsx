"use client";
import { useState, useEffect, useCallback } from "react";
import { Orbitron } from "next/font/google";

const orbitron = Orbitron({ subsets: ["latin"] });

interface TeamDoc {
  id: string;
  name: string;
  tag: string;
  captainId: number;
  memberCount: number;
  totalPoints: number;
  createdAt: string;
}

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<TeamDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Edit Modal State
  const [editingTeam, setEditingTeam] = useState<TeamDoc | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    tag: "",
    description: "",
    totalPoints: 0,
  });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/teams");
      const data = await res.json();
      setTeams(data.teams ?? []);
    } catch (err) {
      setError("Failed to load teams");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/teams/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTeams(teams.filter((t) => t.id !== id));
        setDeleteConfirm(null);
      } else {
        alert("Failed to delete team");
      }
    } catch (err) {
      alert("Error deleting team");
    }
  };

  const openEditModal = (team: TeamDoc & { description?: string }) => {
    setEditingTeam(team);
    setEditForm({
      name: team.name,
      tag: team.tag,
      description: team.description || "",
      totalPoints: team.totalPoints,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingTeam) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/teams/${editingTeam.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setEditingTeam(null);
        load();
      } else {
        alert("Failed to update team");
      }
    } catch (err) {
      alert("Error saving team");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-400 p-8 font-mono">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <a
              href="/"
              className="text-green-700 font-mono text-xs hover:text-green-400 transition-colors"
            >
              ← Back to dashboard
            </a>
            <h1 className={`${orbitron.className} text-3xl font-bold text-green-400`}>
              Team Management
            </h1>
          </div>
        </div>

        {loading ? (
          <p className="font-mono text-green-700 text-sm">Loading...</p>
        ) : error ? (
          <div className="text-red-500 border border-red-900 bg-red-950/20 p-4 rounded">
            {error}
          </div>
        ) : (
          <div className="overflow-x-auto border border-green-900 rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-green-950/30 border-b border-green-900">
                  <th className="p-4 text-xs uppercase tracking-widest text-green-600">Team Name</th>
                  <th className="p-4 text-xs uppercase tracking-widest text-green-600">Tag</th>
                  <th className="p-4 text-xs uppercase tracking-widest text-green-600">Members</th>
                  <th className="p-4 text-xs uppercase tracking-widest text-green-600">Points</th>
                  <th className="p-4 text-xs uppercase tracking-widest text-green-600">Created At</th>
                  <th className="p-4 text-xs uppercase tracking-widest text-green-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-950">
                {teams.map((team) => (
                  <tr key={team.id} className="hover:bg-green-950/10 transition-colors">
                    <td className="p-4 font-bold text-green-200">{team.name}</td>
                    <td className="p-4"><span className="bg-green-900/40 px-2 py-0.5 rounded text-xs border border-green-800">[{team.tag}]</span></td>
                    <td className="p-4 text-green-500">{team.memberCount}</td>
                    <td className="p-4 text-green-300">{team.totalPoints}</td>
                    <td className="p-4 text-xs text-green-700">{new Date(team.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(team)}
                        className="px-3 py-1 border border-yellow-800 rounded text-xs font-mono text-yellow-500 hover:bg-yellow-900/30 transition-colors"
                      >
                        Edit
                      </button>
                      {deleteConfirm === team.id ? (
                        <div className="flex justify-end gap-2 inline-flex">
                          <button
                            onClick={() => handleDelete(team.id)}
                            className="px-3 py-1 border border-red-800 rounded text-xs font-mono text-red-500 hover:bg-red-900/30 transition-colors"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-3 py-1 border border-gray-600 rounded text-xs font-mono text-gray-400 hover:bg-gray-800/30 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(team.id)}
                          className="px-3 py-1 border border-red-800 rounded text-xs font-mono text-red-500 hover:bg-red-900/30 transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Edit Modal */}
        {editingTeam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="bg-[#0f0f0f] border-2 border-green-900 p-8 max-w-md w-full">
              <h2 className={`${orbitron.className} text-xl font-bold text-green-400 mb-6`}>
                Edit Team: {editingTeam.name}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-green-600 mb-1 uppercase tracking-widest">Team Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-black border border-green-900 text-green-300 px-4 py-2 outline-none focus:border-green-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-green-600 mb-1 uppercase tracking-widest">Tag</label>
                  <input
                    type="text"
                    value={editForm.tag}
                    onChange={(e) => setEditForm({ ...editForm, tag: e.target.value.toUpperCase() })}
                    className="w-full bg-black border border-green-900 text-green-300 px-4 py-2 outline-none focus:border-green-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-green-600 mb-1 uppercase tracking-widest">Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full bg-black border border-green-900 text-green-300 px-4 py-2 outline-none focus:border-green-400 h-24 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-green-600 mb-1 uppercase tracking-widest">Total Points</label>
                  <input
                    type="number"
                    value={editForm.totalPoints}
                    onChange={(e) => setEditForm({ ...editForm, totalPoints: Number(e.target.value) })}
                    className="w-full bg-black border border-green-900 text-green-300 px-4 py-2 outline-none focus:border-green-400"
                  />
                </div>
                <div className="flex gap-4 pt-4 border-t border-green-900 justify-end">
                  <button
                    onClick={() => setEditingTeam(null)}
                    className="px-4 py-2 font-mono text-sm text-green-600 hover:text-green-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={saving}
                    className="px-4 py-2 font-mono text-sm bg-green-900/30 border border-green-700 text-green-400 hover:bg-green-900/50 transition-colors disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
