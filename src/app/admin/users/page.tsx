"use client";
import { useState, useEffect } from "react";
import { Orbitron } from "next/font/google";

const orbitron = Orbitron({ subsets: ["latin"] });

interface UserRow {
  id: number;
  username: string;
  userTag?: string;
  email: string;
  role: string;
  avatarUrl?: string;
  createdAt: string;
  solveCount: number;
  totalPoints: number;
  bonusPoints: number;
  solvePoints: number;
  hintCosts: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    role: "",
    avatarUrl: "",
    password: "",
    totalPoints: 0,
  });
  const [savingUser, setSavingUser] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setUsers(data.users);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  async function deleteUser(user: UserRow) {
    if (
      !confirm(
        `Delete user "${user.username}"?\nAll their solves will be deleted and firstBlood will be reset.`,
      )
    )
      return;
    setDeleting(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Ошибка удаления");
    } finally {
      setDeleting(null);
    }
  }

  const openEditModal = (user: UserRow) => {
    setEditingUser(user);
    setEditForm({
      username: user.username,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl || "",
      password: "",
      totalPoints: user.totalPoints || 0,
    });
  };

  const saveEditedUser = async () => {
    if (!editingUser) return;
    setSavingUser(true);
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update user");
      setEditingUser(null);
      fetchUsers();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSavingUser(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-400 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
          <a
            href="/"
            className="text-green-700 font-mono text-xs hover:text-green-400 transition-colors"
          >
            ← Back to dashboard
          </a>
          <h1
            className={`${orbitron.className} text-3xl font-bold text-green-400`}
          >
            Users
          </h1>
          </div>
        </div>

        {loading && (
          <p className="text-green-600 font-mono text-sm">Loading...</p>
        )}

        {error && (
          <p className="text-red-500 font-mono text-sm">Error: {error}</p>
        )}

        {!loading && !error && (
          <div className="border border-green-800 rounded-lg overflow-hidden">
            <table className="w-full font-mono text-sm">
              <thead>
                <tr className="border-b border-green-800 bg-green-950/30">
                  <th className="text-left px-4 py-3 text-green-600 uppercase tracking-widest text-xs">
                    ID
                  </th>
                  <th className="text-left px-4 py-3 text-green-600 uppercase tracking-widest text-xs">
                    UUID
                  </th>
                  <th className="text-left px-4 py-3 text-green-600 uppercase tracking-widest text-xs">
                    Username
                  </th>
                  <th className="text-left px-4 py-3 text-green-600 uppercase tracking-widest text-xs">
                    Email
                  </th>
                  <th className="text-left px-4 py-3 text-green-600 uppercase tracking-widest text-xs">
                    Role
                  </th>
                  <th className="text-left px-4 py-3 text-green-600 uppercase tracking-widest text-xs">
                    Solves
                  </th>
                  <th className="text-left px-4 py-3 text-green-600 uppercase tracking-widest text-xs">
                    Points
                  </th>
                  <th className="text-left px-4 py-3 text-green-600 uppercase tracking-widest text-xs">
                    Registered
                  </th>
                  <th className="px-4 py-3 text-right text-green-600 uppercase tracking-widest text-xs">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-6 text-center text-green-700"
                    >
                      No users found
                    </td>
                  </tr>
                )}
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-green-900/50 hover:bg-green-950/20 transition-colors"
                  >
                    <td className="px-4 py-3 text-green-600">{user.id}</td>
                    <td className="px-4 py-3 text-green-300">
                      {user.userTag ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-green-300 font-semibold">
                      {user.username}
                    </td>
                    <td className="px-4 py-3 text-green-500">{user.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs border ${
                          user.role === "admin"
                            ? "border-yellow-700 text-yellow-400 bg-yellow-900/20"
                            : "border-green-800 text-green-600 bg-green-950/20"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-green-400">
                      {user.solveCount}
                    </td>
                    <td className="px-4 py-3 text-green-400 font-bold">
                      {user.totalPoints}
                    </td>
                    <td className="px-4 py-3 text-green-600 text-xs">
                      {new Date(user.createdAt).toLocaleDateString("ru-RU", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="px-3 py-1 border border-yellow-800 rounded text-xs font-mono text-yellow-500 hover:bg-yellow-900/30 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteUser(user)}
                        disabled={deleting === user.id}
                        className="px-3 py-1 border border-red-800 rounded text-xs font-mono text-red-500 hover:bg-red-900/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        {deleting === user.id ? "..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {editingUser && (
          <div
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setEditingUser(null)}
          >
            <div
              className="bg-black border border-green-800 w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-green-900 flex justify-between items-center">
                <h2 className={`${orbitron.className} text-lg text-green-400`}>
                  Edit User: {editingUser.username}
                </h2>
                <button
                  onClick={() => setEditingUser(null)}
                  className="text-green-700 hover:text-white text-2xl leading-none"
                >
                  ×
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-green-700 mb-1 font-mono">Username</label>
                  <input
                    value={editForm.username}
                    onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                    className="w-full bg-black border border-green-900 text-green-400 px-3 py-2 font-mono text-sm focus:border-green-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-green-700 mb-1 font-mono">Email</label>
                  <input
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    className="w-full bg-black border border-green-900 text-green-400 px-3 py-2 font-mono text-sm focus:border-green-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-green-700 mb-1 font-mono">Avatar URL</label>
                  <input
                    value={editForm.avatarUrl}
                    placeholder="https://..."
                    onChange={(e) => setEditForm({...editForm, avatarUrl: e.target.value})}
                    className="w-full bg-black border border-green-900 text-green-400 px-3 py-2 font-mono text-sm focus:border-green-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-green-700 mb-1 font-mono">New Password</label>
                  <input
                    type="password"
                    value={editForm.password}
                    placeholder="Leave blank to keep current"
                    onChange={(e) => setEditForm({...editForm, password: e.target.value})}
                    className="w-full bg-black border border-green-900 text-green-400 px-3 py-2 font-mono text-sm focus:border-green-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-green-700 mb-1 font-mono">Total Points (Direct Set)</label>
                  <div className="flex gap-4 items-center mb-2">
                    <div className="bg-green-950/20 border border-green-900 p-2 rounded text-[10px] font-mono flex-1">
                      <span className="text-green-700">Solved:</span> <span className="text-green-400">+{editingUser.solvePoints}</span>
                    </div>
                    <div className="bg-red-950/20 border border-red-900 p-2 rounded text-[10px] font-mono flex-1">
                      <span className="text-red-700">Hints:</span> <span className="text-red-400">-{editingUser.hintCosts}</span>
                    </div>
                  </div>
                  <input
                    type="number"
                    value={editForm.totalPoints}
                    onChange={(e) => setEditForm({...editForm, totalPoints: parseInt(e.target.value, 10) || 0})}
                    className="w-full bg-black border border-green-900 text-green-400 px-3 py-2 font-mono text-sm focus:border-green-500 focus:outline-none transition-colors"
                  />
                  <p className="text-[10px] text-green-800 mt-1 italic">Type the exact points you want the user to have. The system will calculate the adjustment automatically.</p>
                </div>
              </div>
              <div className="p-6 border-t border-green-900 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 font-mono text-sm text-green-600 hover:text-green-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEditedUser}
                  disabled={savingUser}
                  className="px-4 py-2 font-mono text-sm bg-green-900/30 border border-green-700 text-green-400 hover:bg-green-900/50 transition-colors disabled:opacity-50"
                >
                  {savingUser ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
