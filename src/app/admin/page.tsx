import { cookies } from "next/headers";
import {
  parseAdminSessionToken,
  getAdminSessionCookieName,
} from "@/lib/auth/adminSession";
import { Orbitron } from "next/font/google";
import {
  countChallenges,
  countSolvesToday,
} from "@/lib/storage/challengeStore";
import { mongoCount } from "@/lib/db/mongodb";

const orbitron = Orbitron({ subsets: ["latin"] });

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getAdminSessionCookieName())?.value;
  const session = await parseAdminSessionToken(token);

  const [userCount, challengeCount, solvesToday] = await Promise.all([
    mongoCount("users", {}).catch(() => 0),
    countChallenges().catch(() => 0),
    countSolvesToday().catch(() => 0),
  ]);

  return (
    <div className="min-h-screen bg-black text-green-400 p-8">
      <div className="max-w-5xl mx-auto">
        <h1
          className={`${orbitron.className} text-3xl font-bold mb-2 text-green-400`}
        >
          Admin Panel
        </h1>
        <p className="text-green-600 mb-8 font-mono text-sm">
          Logged in as{" "}
          <span className="text-green-300">{session?.username ?? "admin"}</span>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="border border-green-800 rounded-lg p-5 bg-green-950/20">
            <p className="text-green-600 text-xs font-mono uppercase tracking-widest mb-1">
              Users
            </p>
            <p className="text-2xl font-bold text-green-300">{userCount}</p>
          </div>
          <div className="border border-green-800 rounded-lg p-5 bg-green-950/20">
            <p className="text-green-600 text-xs font-mono uppercase tracking-widest mb-1">
              Challenges
            </p>
            <p className="text-2xl font-bold text-green-300">
              {challengeCount}
            </p>
          </div>
          <div className="border border-green-800 rounded-lg p-5 bg-green-950/20">
            <p className="text-green-600 text-xs font-mono uppercase tracking-widest mb-1">
              Solves Today
            </p>
            <p className="text-2xl font-bold text-green-300">{solvesToday}</p>
          </div>
        </div>

        <div className="border border-green-800 rounded-lg p-6 bg-green-950/10">
          <h2
            className={`${orbitron.className} text-lg font-semibold mb-4 text-green-400`}
          >
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-3">
            <a
              href="/challenges"
              className="px-4 py-2 border border-green-700 rounded font-mono text-sm text-green-400 hover:bg-green-700 hover:text-black transition-all duration-200"
            >
              Manage Challenges
            </a>
            <a
              href="/users"
              className="px-4 py-2 border border-green-700 rounded font-mono text-sm text-green-400 hover:bg-green-700 hover:text-black transition-all duration-200"
            >
              Manage Users
            </a>
            <button
              disabled
              className="px-4 py-2 border border-green-800 rounded font-mono text-sm text-green-600 opacity-50 cursor-not-allowed"
            >
              View Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
