"use client";
import { useState } from "react";
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
  country: string;
  streak: number;
}

const leaderboardData: LeaderboardEntry[] = [
  { rank: 1, username: "h4x0r_elite", points: 12450, solves: 87, firstBloods: 23, country: "🇺🇸", streak: 45 },
  { rank: 2, username: "crypto_king", points: 11230, solves: 76, firstBloods: 18, country: "🇬🇧", streak: 32 },
  { rank: 3, username: "pwn_master", points: 10890, solves: 82, firstBloods: 15, country: "🇩🇪", streak: 28 },
  { rank: 4, username: "rev_god", points: 9870, solves: 69, firstBloods: 12, country: "🇯🇵", streak: 21 },
  { rank: 5, username: "forensic_eye", points: 9340, solves: 91, firstBloods: 8, country: "🇨🇦", streak: 19 },
  { rank: 6, username: "xss_ninja", points: 8950, solves: 64, firstBloods: 14, country: "🇫🇷", streak: 17 },
  { rank: 7, username: "chain_breaker", points: 8720, solves: 58, firstBloods: 16, country: "🇰🇷", streak: 15 },
  { rank: 8, username: "exploit_dev", points: 8340, solves: 71, firstBloods: 9, country: "🇦🇺", streak: 13 },
  { rank: 9, username: "mobile_hacker", points: 7980, solves: 67, firstBloods: 7, country: "🇮🇳", streak: 11 },
  { rank: 10, username: "osint_master", points: 7650, solves: 94, firstBloods: 5, country: "🇧🇷", streak: 9 },
  { rank: 11, username: "binary_beast", points: 7340, solves: 53, firstBloods: 11, country: "🇷🇺", streak: 8 },
  { rank: 12, username: "hw_wizard", points: 7120, solves: 49, firstBloods: 13, country: "🇨🇳", streak: 7 },
  { rank: 13, username: "steg_hunter", points: 6890, solves: 78, firstBloods: 6, country: "🇪🇸", streak: 6 },
  { rank: 14, username: "token_thief", points: 6540, solves: 62, firstBloods: 4, country: "🇮🇹", streak: 5 },
  { rank: 15, username: "network_ninja", points: 6230, solves: 55, firstBloods: 8, country: "🇳🇱", streak: 4 },
  { rank: 16, username: "sql_slayer", points: 5980, solves: 68, firstBloods: 3, country: "🇸🇪", streak: 3 },
  { rank: 17, username: "cloud_pwner", points: 5670, solves: 51, firstBloods: 7, country: "🇨🇭", streak: 2 },
  { rank: 18, username: "web_warrior", points: 5340, solves: 73, firstBloods: 2, country: "🇵🇱", streak: 1 },
  { rank: 19, username: "malware_analyst", points: 5120, solves: 47, firstBloods: 5, country: "🇧🇪", streak: 12 },
  { rank: 20, username: "script_kiddie_pro", points: 4890, solves: 59, firstBloods: 1, country: "🇦🇹", streak: 8 },
];

export default function Leaderboard() {
  const [timeframe, setTimeframe] = useState<"all-time" | "monthly" | "weekly">("all-time");

  const getRankStyle = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-2 border-yellow-500";
    if (rank === 2) return "bg-gradient-to-r from-gray-300/20 to-gray-400/20 border-2 border-gray-400";
    if (rank === 3) return "bg-gradient-to-r from-orange-600/20 to-orange-700/20 border-2 border-orange-600";
    return "bg-[#0f0f0f] border border-gray-800 hover:border-zerogreen/50";
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <span className="text-3xl">🥇</span>;
    if (rank === 2) return <span className="text-3xl">🥈</span>;
    if (rank === 3) return <span className="text-3xl">🥉</span>;
    return <span className={`text-gray-500 font-bold text-xl ${robotoMono.className}`}>#{rank}</span>;
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className={`text-5xl font-bold text-white mb-4 ${orbitron.className}`}>
            <span className="text-zerogreen">{'>'}</span> Leaderboard
          </h1>
          <p className="text-gray-400 text-lg">The elite hackers who conquered the challenges</p>
        </div>

        <div className="flex justify-center gap-4 mb-8">
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

        <div className="mb-8">
          <Card className="bg-[#0a0a0a] border border-zerogreen/30 overflow-hidden">
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zerogreen/30 bg-zerogreen/10">
                      <th className={`text-left p-4 text-zerogreen font-bold ${orbitron.className}`}>Rank</th>
                      <th className={`text-left p-4 text-zerogreen font-bold ${orbitron.className}`}>Player</th>
                      <th className={`text-center p-4 text-zerogreen font-bold ${orbitron.className}`}>Points</th>
                      <th className={`text-center p-4 text-zerogreen font-bold ${orbitron.className}`}>Solves</th>
                      <th className={`text-center p-4 text-zerogreen font-bold ${orbitron.className}`}>First Bloods</th>
                      <th className={`text-center p-4 text-zerogreen font-bold ${orbitron.className}`}>Streak</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboardData.map((entry) => (
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
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{entry.country}</span>
                            <span className={`text-white font-bold ${robotoMono.className} hover:text-zerogreen transition-colors cursor-pointer`}>
                              {entry.username}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`text-zerogreen font-bold text-lg ${robotoMono.className}`}>
                            {entry.points.toLocaleString()}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <Chip size="sm" className="bg-blue-500/20 text-blue-400 font-bold">
                            {entry.solves}
                          </Chip>
                        </td>
                        <td className="p-4 text-center">
                          <Chip size="sm" className="bg-red-500/20 text-red-400 font-bold">
                            🩸 {entry.firstBloods}
                          </Chip>
                        </td>
                        <td className="p-4 text-center">
                          <Chip size="sm" className="bg-orange-500/20 text-orange-400 font-bold">
                            🔥 {entry.streak}
                          </Chip>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border-2 border-yellow-500">
            <CardBody className="text-center py-8">
              <div className="text-5xl mb-3">🥇</div>
              <h3 className={`text-2xl font-bold text-yellow-400 mb-2 ${orbitron.className}`}>1st Place</h3>
              <p className={`text-white text-xl font-bold ${robotoMono.className}`}>{leaderboardData[0].username}</p>
              <p className="text-yellow-300 text-3xl font-bold mt-2">{leaderboardData[0].points.toLocaleString()} pts</p>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-gray-300/10 to-gray-400/10 border-2 border-gray-400">
            <CardBody className="text-center py-8">
              <div className="text-5xl mb-3">🥈</div>
              <h3 className={`text-2xl font-bold text-gray-300 mb-2 ${orbitron.className}`}>2nd Place</h3>
              <p className={`text-white text-xl font-bold ${robotoMono.className}`}>{leaderboardData[1].username}</p>
              <p className="text-gray-300 text-3xl font-bold mt-2">{leaderboardData[1].points.toLocaleString()} pts</p>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-orange-600/10 to-orange-700/10 border-2 border-orange-600">
            <CardBody className="text-center py-8">
              <div className="text-5xl mb-3">🥉</div>
              <h3 className={`text-2xl font-bold text-orange-400 mb-2 ${orbitron.className}`}>3rd Place</h3>
              <p className={`text-white text-xl font-bold ${robotoMono.className}`}>{leaderboardData[2].username}</p>
              <p className="text-orange-300 text-3xl font-bold mt-2">{leaderboardData[2].points.toLocaleString()} pts</p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
