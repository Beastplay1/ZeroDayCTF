"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Orbitron, Roboto_Mono } from "next/font/google";
import { Card, CardBody, Chip, Button, Progress } from "@heroui/react";
import Link from "next/link";

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

interface TeamInfo {
  id: string;
  name: string;
  tag: string;
  avatarUrl?: string;
}

interface PublicProfileData {
  id: number;
  username: string;
  userTag?: string;
  avatarUrl?: string;
  createdAt: string;
  solveCount: number;
  totalPoints: number;
  firstBloods: number;
  rank: number | null;
  solvedChallenges: SolvedChallenge[];
  categoryBreakdown: Record<string, number>;
  team: TeamInfo | null;
}

export default function PublicProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const unwrappedParams = use(params);
  const slug = decodeURIComponent(unwrappedParams.slug);
  const router = useRouter();
  
  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [friendStatus, setFriendStatus] = useState<"none" | "pending" | "friends">("none");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "stats">("overview");

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        setIsLoggedIn(Boolean(data.authenticated));
      } catch (e) {
        setIsLoggedIn(false);
      }
    };
    fetchSession();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/users/profile/${encodeURIComponent(slug)}`);
        if (!res.ok) {
          if (res.status === 404) setError("User not found");
          else setError("Error loading profile");
          return;
        }
        const data = await res.json();
        
        // If viewing own profile, redirect to /profile
        if (data.isOwnProfile) {
          router.replace("/profile");
          return;
        }
        
        setProfile(data.profile);
        if (data.friendStatus) {
          setFriendStatus(data.friendStatus);
        }
      } catch (err) {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [slug, router]);

  const sendFriendRequest = async () => {
    try {
      const res = await fetch("/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetSlug: slug }),
      });
      const data = await res.json();
      if (res.ok) {
        setFriendStatus("pending");
      } else {
        alert(data.error);
      }
    } catch (e) {
      alert("Error sending request");
    }
  };

  const removeFriend = async () => {
    try {
      const res = await fetch("/api/friends/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetSlug: slug }),
      });
      const data = await res.json();
      if (res.ok) {
        setFriendStatus("none");
      } else {
        alert(data.error);
      }
    } catch (e) {
      alert("Error removing friend");
    }
  };

  const categoryChipColors: Record<string, string> = {
    Web: "bg-blue-500/20 text-blue-400 border-blue-500/50",
    Crypto: "bg-purple-500/20 text-purple-400 border-purple-500/50",
    Pwn: "bg-red-500/20 text-red-400 border-red-500/50",
    "Reverse Engineering": "bg-orange-500/20 text-orange-400 border-orange-500/50",
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

  const categoryColors: Record<string, string> = {
    Web: "bg-blue-500",
    Crypto: "bg-purple-500",
    Pwn: "bg-red-500",
    "Reverse Engineering": "bg-orange-500",
    Forensics: "bg-cyan-500",
    Mobile: "bg-green-500",
    Hardware: "bg-yellow-500",
  };

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white font-mono">Loading...</div>;
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-500 font-mono">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p>{error || "User not found"}</p>
      </div>
    );
  }

  const recentSolves = profile.solvedChallenges.slice(0, 5);
  const categoryStats = Object.entries(profile.categoryBreakdown).map(([category, solved]) => ({
    category,
    solved,
    color: categoryColors[category] ?? "bg-gray-500",
  }));

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <Card className="bg-gradient-to-r from-zerogreen/10 via-transparent to-purple-500/10 border-2 border-zerogreen/30 mb-8">
          <CardBody className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className={`w-32 h-32 rounded-full flex items-center justify-center text-6xl font-bold overflow-hidden border-2 border-zerogreen ${profile.avatarUrl ? "bg-transparent" : "bg-gradient-to-br from-zerogreen to-purple-500 text-black"}`}>
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Avatar" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                ) : (
                  profile.username[0]?.toUpperCase() ?? "?"
                )}
              </div>
              <div className="flex-grow text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4 justify-center md:justify-start">
                  <h1 className={`text-4xl font-bold text-white ${robotoMono.className}`}>
                    {profile.username}
                    {profile.userTag && <span className="text-gray-500 text-2xl ml-2">#{profile.userTag}</span>}
                  </h1>
                  {friendStatus === "friends" ? (
                    <Button 
                      onClick={removeFriend} 
                      variant="bordered"
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10 font-bold font-mono px-6 rounded-full uppercase tracking-wider text-sm mt-2 md:mt-0 transition-colors"
                    >
                      Remove Friend
                    </Button>
                  ) : friendStatus === "pending" ? (
                    <Button 
                      disabled
                      variant="bordered"
                      className="border-yellow-500/50 text-yellow-500 font-bold font-mono px-6 rounded-full uppercase tracking-wider text-sm mt-2 md:mt-0 opacity-80 cursor-not-allowed"
                    >
                      Request Sent
                    </Button>
                  ) : (
                    <Button 
                      onClick={isLoggedIn ? sendFriendRequest : undefined} 
                      disabled={!isLoggedIn}
                      className={`${isLoggedIn ? "bg-zerogreen text-black hover:bg-[#07a020]" : "bg-gray-600 text-gray-300 cursor-not-allowed"} font-bold font-mono px-6 rounded-full uppercase tracking-wider text-sm mt-2 md:mt-0 transition-colors`}
                    >
                      {!isLoggedIn ? "Sign Up/Sign In to Add Friend" : "Add Friend"}
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  {profile.rank !== null && (
                    <Chip className="bg-yellow-500/20 text-yellow-400 font-bold">
                      🏆 Rank #{profile.rank}
                    </Chip>
                  )}
                  <Chip className="bg-zerogreen/20 text-zerogreen font-bold">
                    {profile.totalPoints.toLocaleString()} Points
                  </Chip>
                  <Chip className="bg-blue-500/20 text-blue-400 font-bold">
                    {profile.solveCount} Solves
                  </Chip>
                  <Chip className="bg-red-500/20 text-red-400 font-bold">
                    🩸 {profile.firstBloods} First Bloods
                  </Chip>
                </div>
              </div>
              <div className="text-center">
                <p className="text-gray-500 text-sm mt-2">
                  Joined {new Date(profile.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Team Card */}
        {profile.team && (
          <Card className="bg-[#0f0f0f] border border-gray-800 hover:border-zerogreen/50 transition-all duration-300 mb-8">
            <CardBody className="p-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded flex items-center justify-center text-xl font-bold overflow-hidden border border-zerogreen/50 ${profile.team.avatarUrl ? "bg-transparent" : "bg-gradient-to-br from-zerogreen to-blue-500 text-black"}`}>
                  {profile.team.avatarUrl ? (
                    <img src={profile.team.avatarUrl} alt="Team" className="w-full h-full object-cover" />
                  ) : (
                    profile.team.name[0]?.toUpperCase()
                  )}
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-mono uppercase tracking-wider">Team</p>
                  <Link href={`/teams/${profile.team.id}`} className="text-white font-bold hover:text-zerogreen transition-colors">
                    {profile.team.name} <span className="text-gray-500">[{profile.team.tag}]</span>
                  </Link>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Tabs */}
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
            {/* Achievements */}
            <div>
              <h2 className={`text-2xl font-bold text-white mb-4 ${orbitron.className}`}>
                <span className="text-zerogreen">◆</span> Achievements
              </h2>
              <p className="text-gray-500">Coming soon.</p>
            </div>

            {/* Recent Solves */}
            <div>
              <h2 className={`text-2xl font-bold text-white mb-4 ${orbitron.className}`}>
                <span className="text-zerogreen">◆</span> Recent Solves
              </h2>
              {recentSolves.length === 0 ? (
                <p className="text-gray-500">No solves yet.</p>
              ) : (
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
                              <h3 className={`text-lg font-bold text-white ${orbitron.className}`}>
                                {challenge.name}
                              </h3>
                              {challenge.wasFirstBlood && (
                                <Chip size="sm" className="bg-red-500/20 text-red-400 font-bold">
                                  🩸 First Blood
                                </Chip>
                              )}
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              <span className={`text-xs px-2 py-1 rounded-full border ${categoryChipColors[challenge.category] ?? "bg-gray-500/20 text-gray-400 border-gray-500/50"} font-bold`}>
                                {challenge.category}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full border ${difficultyChipColors[challenge.difficulty] ?? "bg-gray-500/20 text-gray-400 border-gray-500/50"} font-bold`}>
                                {challenge.difficulty}
                              </span>
                              <span className="text-xs px-2 py-1 rounded-full border bg-zerogreen/20 text-zerogreen border-zerogreen/50 font-bold">
                                +{challenge.points} pts
                              </span>
                            </div>
                          </div>
                          <div className="text-gray-500 text-sm text-right">
                            {formatDate(challenge.solvedAt)}
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {activeTab === "stats" && (
          <div className="space-y-6">
            {/* Category Progress */}
            {categoryStats.length > 0 ? (
              <div>
                <h2 className={`text-2xl font-bold text-white mb-4 ${orbitron.className}`}>
                  <span className="text-zerogreen">◆</span> Category Progress
                </h2>
                <div className="space-y-4">
                  {categoryStats.map((stat, index) => {
                    const maxSolved = Math.max(...categoryStats.map((s) => s.solved), 1);
                    return (
                      <Card key={index} className="bg-[#0f0f0f] border border-gray-800 hover:border-zerogreen/50 transition-all duration-300">
                        <CardBody className="p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-white font-bold">{stat.category}</span>
                            <span className="text-gray-400">{stat.solved} solved</span>
                          </div>
                          <Progress
                            value={(stat.solved / maxSolved) * 100}
                            className="h-2"
                            classNames={{ indicator: stat.color }}
                          />
                        </CardBody>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div>
                <h2 className={`text-2xl font-bold text-white mb-4 ${orbitron.className}`}>
                  <span className="text-zerogreen">◆</span> Category Progress
                </h2>
                <p className="text-gray-500">No solves yet.</p>
              </div>
            )}
          </div>
        )}

        
      </div>
    </div>
  );
}
