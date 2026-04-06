"use client";
import { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Button,
  Progress,
} from "@heroui/react";
import { Orbitron, Roboto_Mono } from "next/font/google";

const orbitron = Orbitron({ subsets: ["latin"] });
const robotoMono = Roboto_Mono({ subsets: ["latin"] });

interface SolvedChallenge {
  challengeId: string;
  name: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Insane";
  points: number;
  solvedAt: string;
  wasFirstBlood: boolean;
}

interface ProfileData {
  authenticated: boolean;
  username?: string;
  totalPoints?: number;
  totalSolves?: number;
  firstBloods?: number;
  rank?: number | null;
  solvedChallenges?: SolvedChallenge[];
  categoryBreakdown?: Record<string, number>;
}

export default function Profile() {
  const [activeTab, setActiveTab] = useState<"overview" | "solved" | "stats">(
    "overview",
  );
  const [sessionUsername, setSessionUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" });
        const data = await res.json();
        if (data?.authenticated && data?.user?.username) {
          setSessionUsername(data.user.username);
        } else {
          setSessionUsername("anonymous");
        }
      } catch {
        setSessionUsername("anonymous");
      }
      setLoading(false);
    };
    loadSession();
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch("/api/profile", { cache: "no-store" });
        const data = await res.json();
        setProfileData(data);
      } catch {
        setProfileData({ authenticated: false });
      }
    };
    loadProfile();
  }, []);

  const isAnonymous = sessionUsername === "anonymous";
  const userData = {
    username: sessionUsername || "",
    rank: profileData?.rank ?? null,
    totalPoints: profileData?.totalPoints ?? 0,
    totalSolves: profileData?.totalSolves ?? 0,
    firstBloods: profileData?.firstBloods ?? 0,
  };
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
        <div className="text-center text-zerogreen text-xl animate-pulse">
          Loading profile...
        </div>
      </div>
    );
  }

  const solvedChallenges: SolvedChallenge[] =
    profileData?.solvedChallenges ?? [];
  const recentSolves = solvedChallenges.slice(0, 5);

  const categoryColors: Record<string, string> = {
    Web: "bg-blue-500",
    Crypto: "bg-purple-500",
    Pwn: "bg-red-500",
    "Reverse Engineering": "bg-orange-500",
    Forensics: "bg-cyan-500",
    Mobile: "bg-green-500",
    Hardware: "bg-yellow-500",
  };

  const categoryStats = Object.entries(
    profileData?.categoryBreakdown ?? {},
  ).map(([category, solved]) => ({
    category,
    solved,
    color: categoryColors[category] ?? "bg-gray-500",
  }));

  const categoryChipColors: Record<string, string> = {
    Web: "bg-blue-500/20 text-blue-400 border-blue-500/50",
    Crypto: "bg-purple-500/20 text-purple-400 border-purple-500/50",
    Pwn: "bg-red-500/20 text-red-400 border-red-500/50",
    "Reverse Engineering":
      "bg-orange-500/20 text-orange-400 border-orange-500/50",
    Forensics: "bg-cyan-500/20 text-cyan-400 border-cyan-500/50",
    Binary: "bg-pink-500/20 text-pink-400 border-pink-500/50",
    OSINT: "bg-indigo-500/20 text-indigo-400 border-indigo-500/50",
    Misc: "bg-gray-500/20 text-gray-400 border-gray-500/50",
  };

  const difficultyChipColors: Record<string, string> = {
    Easy: "bg-green-500/20 text-green-400 border-green-500/50",
    Medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
    Hard: "bg-red-500/20 text-red-400 border-red-500/50",
    Insane: "bg-purple-500/20 text-purple-400 border-purple-500/50",
  };

  const difficultyColors = {
    Easy: "success",
    Medium: "warning",
    Hard: "danger",
    Insane: "secondary",
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <Card className="bg-gradient-to-r from-zerogreen/10 via-transparent to-purple-500/10 border-2 border-zerogreen/30 mb-8">
          <CardBody className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-zerogreen to-purple-500 flex items-center justify-center text-6xl font-bold text-black">
                {userData.username[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="flex-grow text-center md:text-left">
                <div className="flex items-center gap-3 justify-center md:justify-start mb-4">
                  <h1
                    className={`text-4xl font-bold text-white ${robotoMono.className}`}
                  >
                    {userData.username}
                  </h1>
                </div>
                {isAnonymous ? (
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <Chip className="bg-blue-500/20 text-blue-400 font-bold">
                      {userData.totalSolves} Solves
                    </Chip>
                    <Chip className="bg-gray-500/20 text-gray-400 border border-dashed border-gray-600">
                      🔒 Rank — sign up to unlock
                    </Chip>
                    <Chip className="bg-gray-500/20 text-gray-400 border border-dashed border-gray-600">
                      🔒 Points — sign up to unlock
                    </Chip>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    {userData.rank !== null && (
                      <Chip className="bg-yellow-500/20 text-yellow-400 font-bold">
                        🏆 Rank #{userData.rank}
                      </Chip>
                    )}
                    <Chip className="bg-zerogreen/20 text-zerogreen font-bold">
                      {userData.totalPoints.toLocaleString()} Points
                    </Chip>
                    <Chip className="bg-blue-500/20 text-blue-400 font-bold">
                      {userData.totalSolves} Solves
                    </Chip>
                    <Chip className="bg-red-500/20 text-red-400 font-bold">
                      🩸 {userData.firstBloods} First Bloods
                    </Chip>
                  </div>
                )}
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="flex gap-4 mb-6 flex-wrap">
          <Button
            className={`${
              activeTab === "overview"
                ? "bg-zerogreen text-black"
                : "bg-[#0f0f0f] text-gray-400 border border-gray-700 hover:border-zerogreen"
            } transition-all duration-300 font-bold`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </Button>
          <Button
            className={`${
              activeTab === "solved"
                ? "bg-zerogreen text-black"
                : "bg-[#0f0f0f] text-gray-400 border border-gray-700 hover:border-zerogreen"
            } transition-all duration-300 font-bold`}
            onClick={() => setActiveTab("solved")}
          >
            Solved Challenges
          </Button>
          <Button
            className={`${
              activeTab === "stats"
                ? "bg-zerogreen text-black"
                : "bg-[#0f0f0f] text-gray-400 border border-gray-700 hover:border-zerogreen"
            } transition-all duration-300 font-bold`}
            onClick={() => setActiveTab("stats")}
          >
            Statistics
          </Button>
        </div>

        {activeTab === "overview" && (
          <div className="space-y-6">
            <div>
              <h2
                className={`text-2xl font-bold text-white mb-4 ${orbitron.className}`}
              >
                <span className="text-zerogreen">◆</span> Achievements
              </h2>
              {isAnonymous ? (
                <Card className="bg-[#0f0f0f] border border-dashed border-gray-600">
                  <CardBody className="text-center p-6">
                    <p className="text-gray-400 mb-3">
                      Achievements are only available to registered users.
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button
                        as="a"
                        href="/signup"
                        className="bg-zerogreen text-black font-bold"
                        size="sm"
                      >
                        Sign Up
                      </Button>
                      <Button
                        as="a"
                        href="/signin"
                        variant="bordered"
                        className="border-zerogreen text-zerogreen"
                        size="sm"
                      >
                        Sign In
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ) : (
                <p className="text-gray-500">Coming soon.</p>
              )}
            </div>

            <div>
              <h2
                className={`text-2xl font-bold text-white mb-4 ${orbitron.className}`}
              >
                <span className="text-zerogreen">◆</span> Recent Solves
              </h2>
              {recentSolves.length === 0 && (
                <p className="text-gray-500">No solves yet.</p>
              )}
              <div className="space-y-3">
                {recentSolves.map((challenge) => (
                  <Card
                    key={challenge.challengeId}
                    className="bg-[#0f0f0f] border border-gray-800 hover:border-zerogreen/50 transition-all duration-300"
                  >
                    <CardBody className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex-grow">
                          <div className="flex items-center gap-2 mb-2">
                            <h3
                              className={`text-lg font-bold text-white ${orbitron.className}`}
                            >
                              {challenge.name}
                            </h3>
                            {challenge.wasFirstBlood && (
                              <Chip
                                size="sm"
                                className="bg-red-500/20 text-red-400 font-bold"
                              >
                                🩸 First Blood
                              </Chip>
                            )}
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            <span
                              className={`text-xs px-2 py-1 rounded-full border ${categoryChipColors[challenge.category] ?? "bg-gray-500/20 text-gray-400 border-gray-500/50"} font-bold`}
                            >
                              {challenge.category}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full border ${difficultyChipColors[challenge.difficulty] ?? "bg-gray-500/20 text-gray-400 border-gray-500/50"} font-bold`}
                            >
                              {challenge.difficulty}
                            </span>
                            <span className="text-xs px-2 py-1 rounded-full border bg-zerogreen/20 text-zerogreen border-zerogreen/50 font-bold">
                              +{challenge.points} pts
                            </span>
                          </div>
                        </div>
                        <div className="text-gray-500 text-sm text-right">
                          {challenge.solvedAt}
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "solved" && (
          <div>
            <h2
              className={`text-2xl font-bold text-white mb-4 ${orbitron.className}`}
            >
              <span className="text-zerogreen">◆</span> All Solved Challenges (
              {userData.totalSolves})
            </h2>
            {solvedChallenges.length === 0 && (
              <p className="text-gray-500">No solves yet.</p>
            )}
            <div className="space-y-3">
              {solvedChallenges.map((challenge) => (
                <Card
                  key={challenge.challengeId}
                  className="bg-[#0f0f0f] border border-gray-800 hover:border-zerogreen/50 transition-all duration-300"
                >
                  <CardBody className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-2">
                          <h3
                            className={`text-lg font-bold text-white ${orbitron.className}`}
                          >
                            {challenge.name}
                          </h3>
                          {challenge.wasFirstBlood && (
                            <Chip
                              size="sm"
                              className="bg-red-500/20 text-red-400 font-bold"
                            >
                              🩸 First Blood
                            </Chip>
                          )}
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <span
                            className={`text-xs px-2 py-1 rounded-full border ${categoryChipColors[challenge.category] ?? "bg-gray-500/20 text-gray-400 border-gray-500/50"} font-bold`}
                          >
                            {challenge.category}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full border ${difficultyChipColors[challenge.difficulty] ?? "bg-gray-500/20 text-gray-400 border-gray-500/50"} font-bold`}
                          >
                            {challenge.difficulty}
                          </span>
                          <span className="text-xs px-2 py-1 rounded-full border bg-zerogreen/20 text-zerogreen border-zerogreen/50 font-bold">
                            +{challenge.points} pts
                          </span>
                        </div>
                      </div>
                      <div className="text-gray-500 text-sm text-right">
                        {challenge.solvedAt}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "stats" && (
          <div className="space-y-6">
            <div>
              <h2
                className={`text-2xl font-bold text-white mb-4 ${orbitron.className}`}
              >
                <span className="text-zerogreen">◆</span> Category Progress
              </h2>
              <div className="space-y-4">
                {categoryStats.length === 0 && (
                  <p className="text-gray-500">No solves yet.</p>
                )}
                {categoryStats.map((stat, index) => {
                  const maxSolved = Math.max(
                    ...categoryStats.map((s) => s.solved),
                    1,
                  );
                  return (
                    <Card
                      key={index}
                      className="bg-[#0f0f0f] border border-gray-800 hover:border-zerogreen/50 transition-all duration-300"
                    >
                      <CardBody className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-white font-bold">
                            {stat.category}
                          </span>
                          <span className="text-gray-400">
                            {stat.solved} solved
                          </span>
                        </div>
                        <Progress
                          value={(stat.solved / maxSolved) * 100}
                          className="h-2"
                          classNames={{
                            indicator: stat.color,
                          }}
                        />
                      </CardBody>
                    </Card>
                  );
                })}
              </div>
            </div>

            {isAnonymous && (
              <Card className="bg-[#0f0f0f] border border-dashed border-gray-600">
                <CardBody className="text-center p-6">
                  <p className="text-gray-400 mb-3">
                    Detailed stats are only available to registered users.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button
                      as="a"
                      href="/signup"
                      className="bg-zerogreen text-black font-bold"
                      size="sm"
                    >
                      Sign Up
                    </Button>
                    <Button
                      as="a"
                      href="/signin"
                      variant="bordered"
                      className="border-zerogreen text-zerogreen"
                      size="sm"
                    >
                      Sign In
                    </Button>
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
