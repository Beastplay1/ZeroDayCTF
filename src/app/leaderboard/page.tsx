"use client";
import { useState, useEffect } from "react";
import { Card, CardBody, Chip, Button } from "@heroui/react";
import { Orbitron, Roboto_Mono } from "next/font/google";

const orbitron = Orbitron({ subsets: ["latin"] });
const robotoMono = Roboto_Mono({ subsets: ["latin"] });

interface LeaderboardEntry {
  rank: number;
  username: string;
  points: number;
  solves: number;
  firstBloods: number;
}

export default function Leaderboard() {
  const [timeframe, setTimeframe] = useState<"all-time" | "monthly" | "weekly">("all-time");
  const [type, setType] = useState<"users" | "teams">("users");
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => setIsLoggedIn(!!data?.user))
      .catch(() => setIsLoggedIn(false));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaderboard?timeframe=${timeframe}&type=${type}`)
      .then((r) => r.json())
      .then((data) => setLeaderboardData(data.leaderboard ?? []))
      .catch(() => setLeaderboardData([]))
      .finally(() => setLoading(false));
  }, [timeframe, type]);

  const getRankStyle = (rank: number) => {
    if (rank === 1)
      return "bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-2 border-yellow-500";
    if (rank === 2)
      return "bg-gradient-to-r from-gray-300/20 to-gray-400/20 border-2 border-gray-400";
    if (rank === 3)
      return "bg-gradient-to-r from-orange-600/20 to-orange-700/20 border-2 border-orange-600";
    return "bg-[#0f0f0f] border border-gray-800 hover:border-zerogreen/50";
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <span className="text-3xl">🥇</span>;
    if (rank === 2) return <span className="text-3xl">🥈</span>;
    if (rank === 3) return <span className="text-3xl">🥉</span>;
    return (
      <span
        className={`text-gray-500 font-bold text-xl ${robotoMono.className}`}
      >
        #{rank}
      </span>
    );
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1
            className={`text-5xl font-bold text-white mb-4 ${orbitron.className}`}
          >
            <span className="text-zerogreen">{">"}</span> Leaderboard
          </h1>
          <p className="text-gray-400 text-lg">
            The elite hackers who conquered the challenges
          </p>
        </div>

        {isLoggedIn === false && (
          <div className="mb-8 border border-zerogreen/40 bg-zerogreen/5 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p
              className={`text-zerogreen font-mono text-sm ${robotoMono.className}`}
            >
              <span className="text-white font-bold">
                Want to appear on the leaderboard?
              </span>{" "}
              Create an account, or sign in if you already have one.
            </p>
            <div className="flex gap-3 shrink-0">
              <a
                href="/signup"
                className="px-4 py-2 bg-zerogreen text-black font-bold font-mono text-sm hover:bg-zerogreen/80 transition-colors"
              >
                Sign Up
              </a>
              <a
                href="/signin"
                className="px-4 py-2 border border-zerogreen text-zerogreen font-bold font-mono text-sm hover:bg-zerogreen/10 transition-colors"
              >
                Sign In
              </a>
            </div>
          </div>
        )}

        <div className="flex flex-col items-center gap-4 mb-8">
          {/* Type Toggle */}
          <div className="relative flex bg-[#0f0f0f] border border-gray-800 rounded-lg p-1">
            <span
              className={`absolute top-1 bottom-1 w-1/2 rounded-md bg-zerogreen transition-transform duration-300 ${
                type === "users" ? "translate-x-0" : "translate-x-full"
              }`}
            />
            <button
              className={`relative z-10 px-6 py-2 rounded-md font-bold duration-300 ${
                type === "users" ? "text-black" : "text-gray-400"
              }`}
              onClick={() => setType("users")}
            >
              Users
            </button>
            <button
              className={`relative z-10 px-6 py-2 rounded-md font-bold duration-300 ${
                type === "teams" ? "text-black" : "text-gray-400"
              }`}
              onClick={() => setType("teams")}
            >
              Teams
            </button>
          </div>

          {/* Timeframe Toggle */}
          <div className="flex justify-center gap-4">
            <Button
              size="md"
              className={`${
                timeframe === "all-time"
                  ? "bg-zerogreen text-black"
                  : "bg-[#0f0f0f] text-gray-400 border border-gray-700 hover:border-zerogreen"
              } transition-all duration-300 font-bold`}
              onClick={() => setTimeframe("all-time")}
            >
              All Time
            </Button>
            <Button
              size="md"
              className={`${
                timeframe === "monthly"
                  ? "bg-zerogreen text-black"
                  : "bg-[#0f0f0f] text-gray-400 border border-gray-700 hover:border-zerogreen"
              } transition-all duration-300 font-bold`}
              onClick={() => setTimeframe("monthly")}
            >
              Monthly
            </Button>
            <Button
              size="md"
              className={`${
                timeframe === "weekly"
                  ? "bg-zerogreen text-black"
                  : "bg-[#0f0f0f] text-gray-400 border border-gray-700 hover:border-zerogreen"
              } transition-all duration-300 font-bold`}
              onClick={() => setTimeframe("weekly")}
            >
              Weekly
            </Button>
          </div>
        </div>

        <div className="mb-8">
          <Card className="bg-[#0a0a0a] border border-zerogreen/30 overflow-hidden">
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zerogreen/30 bg-zerogreen/10">
                      <th
                        className={`text-left p-4 text-zerogreen font-bold ${orbitron.className}`}
                      >
                        Rank
                      </th>
                      <th
                        className={`text-left p-4 text-zerogreen font-bold ${orbitron.className}`}
                      >
                        {type === "users" ? "Player" : "Team"}
                      </th>
                      <th
                        className={`text-center p-4 text-zerogreen font-bold ${orbitron.className}`}
                      >
                        Points
                      </th>
                      <th
                        className={`text-center p-4 text-zerogreen font-bold ${orbitron.className}`}
                      >
                        Solves
                      </th>
                      <th
                        className={`text-center p-4 text-zerogreen font-bold ${orbitron.className}`}
                      >
                        First Bloods
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr
                          key={i}
                          className="bg-[#0f0f0f] border border-gray-800"
                        >
                          <td colSpan={5} className="p-4">
                            <div className="h-6 bg-zerogreen/5 animate-pulse rounded" />
                          </td>
                        </tr>
                      ))
                    ) : leaderboardData.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="p-12 text-center text-gray-500"
                        >
                          No solves yet. Be the first!
                        </td>
                      </tr>
                    ) : (
                      leaderboardData.map((entry) => (
                        <tr
                          key={entry.rank}
                          className={`${getRankStyle(entry.rank)} transition-all duration-300 hover:bg-zerogreen/5`}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {getRankBadge(entry.rank)}
                            </div>
                          </td>
                          <td className="p-4">
                            {type === "teams" ? (
                              <a href={`/teams/${entry.id}`} className={`text-white font-bold ${robotoMono.className} hover:text-zerogreen transition-colors cursor-pointer block`}>
                                {entry.username} <span className="text-gray-500">[{entry.tag}]</span>
                              </a>
                            ) : (
                              <a href={`/profile/${encodeURIComponent(entry.username)}`} className={`text-white font-bold ${robotoMono.className} hover:text-zerogreen transition-colors cursor-pointer block`}>
                                {entry.username}
                              </a>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            <span
                              className={`text-zerogreen font-bold text-lg ${robotoMono.className}`}
                            >
                              {entry.points.toLocaleString()}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <Chip
                              size="sm"
                              className="bg-blue-500/20 text-blue-400 font-bold"
                            >
                              {entry.solves}
                            </Chip>
                          </td>
                          <td className="p-4 text-center">
                            <Chip
                              size="sm"
                              className="bg-red-500/20 text-red-400 font-bold"
                            >
                              🩸 {entry.firstBloods}
                            </Chip>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </div>

        {!loading && leaderboardData.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border-2 border-yellow-500">
              <CardBody className="text-center py-8">
                <div className="text-5xl mb-3">🥇</div>
                <h3
                  className={`text-2xl font-bold text-yellow-400 mb-2 ${orbitron.className}`}
                >
                  1st Place
                </h3>
                <p
                  className={`text-white text-xl font-bold ${robotoMono.className}`}
                >
                  {leaderboardData[0].username} {type === "teams" && <span className="text-gray-500 text-lg">[{leaderboardData[0].tag}]</span>}
                </p>
                <p className="text-yellow-300 text-3xl font-bold mt-2">
                  {leaderboardData[0].points.toLocaleString()} pts
                </p>
              </CardBody>
            </Card>

            <Card className="bg-gradient-to-br from-gray-300/10 to-gray-400/10 border-2 border-gray-400">
              <CardBody className="text-center py-8">
                <div className="text-5xl mb-3">🥈</div>
                <h3
                  className={`text-2xl font-bold text-gray-300 mb-2 ${orbitron.className}`}
                >
                  2nd Place
                </h3>
                <p
                  className={`text-white text-xl font-bold ${robotoMono.className}`}
                >
                  {leaderboardData[1].username} {type === "teams" && <span className="text-gray-500 text-lg">[{leaderboardData[1].tag}]</span>}
                </p>
                <p className="text-gray-300 text-3xl font-bold mt-2">
                  {leaderboardData[1].points.toLocaleString()} pts
                </p>
              </CardBody>
            </Card>

            <Card className="bg-gradient-to-br from-orange-600/10 to-orange-700/10 border-2 border-orange-600">
              <CardBody className="text-center py-8">
                <div className="text-5xl mb-3">🥉</div>
                <h3
                  className={`text-2xl font-bold text-orange-400 mb-2 ${orbitron.className}`}
                >
                  3rd Place
                </h3>
                <p
                  className={`text-white text-xl font-bold ${robotoMono.className}`}
                >
                  {leaderboardData[2].username} {type === "teams" && <span className="text-gray-500 text-lg">[{leaderboardData[2].tag}]</span>}
                </p>
                <p className="text-orange-300 text-3xl font-bold mt-2">
                  {leaderboardData[2].points.toLocaleString()} pts
                </p>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
