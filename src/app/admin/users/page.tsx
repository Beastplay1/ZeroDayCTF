"use client";
import { useState, useEffect } from "react";
import { Orbitron } from "next/font/google";

const orbitron = Orbitron({ subsets: ["latin"] });

interface UserRow {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  solveCount: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setUsers(data.users);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function deleteUser(user: UserRow) {
    if (
      !confirm(
        `Удалить пользователя "${user.username}"?\nБудут удалены все его solves и сброшены firstBlood.`,
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

  return (
    <div className="min-h-screen bg-black text-green-400 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <a
            href="/"
            className="text-green-700 hover:text-green-400 font-mono text-sm transition-colors"
          >
            ← Back
          </a>
          <h1
            className={`${orbitron.className} text-3xl font-bold text-green-400`}
          >
            Users
          </h1>
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
                    Registered
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
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
                    <td className="px-4 py-3 text-green-600 text-xs">
                      {new Date(user.createdAt).toLocaleDateString("ru-RU", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
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
      </div>
    </div>
  );
}
