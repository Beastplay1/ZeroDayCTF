"use client";
import { useState } from "react";
import { Card, CardBody, CardHeader, Chip, Button, Progress } from "@heroui/react";
import { Orbitron, Roboto_Mono } from "next/font/google";

const orbitron = Orbitron({ subsets: ["latin"] });
const robotoMono = Roboto_Mono({ subsets: ["latin"] });

interface SolvedChallenge {
  id: number;
  name: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Insane";
  points: number;
  solvedAt: string;
  wasFirstBlood: boolean;
}

export default function Profile() {
  const [activeTab, setActiveTab] = useState<"overview" | "solved" | "stats">("overview");

  const userData = {
    username: "h4x0r_elite",
    rank: 1,
    totalPoints: 12450,
    totalSolves: 87,
    firstBloods: 23,
    streak: 45,
    country: "🇺🇸",
    joinedDate: "Jan 15, 2024",
    bio: "Elite hacker specializing in web exploitation and cryptography. CTF enthusiast since 2020.",
  };

  const categoryStats = [
    { category: "Web", solved: 24, total: 50, color: "bg-blue-500" },
    { category: "Crypto", solved: 18, total: 40, color: "bg-purple-500" },
    { category: "Pwn", solved: 15, total: 35, color: "bg-red-500" },
    { category: "Reverse Engineering", solved: 12, total: 30, color: "bg-orange-500" },
    { category: "Forensics", solved: 10, total: 25, color: "bg-cyan-500" },
    { category: "Mobile", solved: 5, total: 20, color: "bg-green-500" },
    { category: "Hardware", solved: 3, total: 15, color: "bg-yellow-500" },
  ];

  const recentSolves: SolvedChallenge[] = [
    { id: 1, name: "SQL Injection Master", category: "Web", difficulty: "Medium", points: 300, solvedAt: "2 hours ago", wasFirstBlood: true },
    { id: 2, name: "RSA Decrypt", category: "Crypto", difficulty: "Hard", points: 500, solvedAt: "5 hours ago", wasFirstBlood: false },
    { id: 3, name: "Buffer Overflow Basic", category: "Pwn", difficulty: "Easy", points: 200, solvedAt: "1 day ago", wasFirstBlood: true },
    { id: 4, name: "Reverse Me", category: "Reverse Engineering", difficulty: "Medium", points: 350, solvedAt: "2 days ago", wasFirstBlood: false },
    { id: 5, name: "XSS Paradise", category: "Web", difficulty: "Hard", points: 450, solvedAt: "3 days ago", wasFirstBlood: true },
  ];

  const achievements = [
    { icon: "🥇", title: "Rank #1", description: "Top of the leaderboard" },
    { icon: "🔥", title: "45 Day Streak", description: "Longest active streak" },
    { icon: "🩸", title: "23 First Bloods", description: "Speed demon" },
    { icon: "⚡", title: "87 Challenges", description: "Challenge conqueror" },
    { icon: "🎯", title: "Web Master", description: "Solved 24 web challenges" },
    { icon: "🔐", title: "Crypto Expert", description: "Solved 18 crypto challenges" },
  ];

  const difficultyColors = {
    Easy: "success",
    Medium: "warning",
    Hard: "danger",
    Insane: "secondary"
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <Card className="bg-gradient-to-r from-zerogreen/10 via-transparent to-purple-500/10 border-2 border-zerogreen/30 mb-8">
          <CardBody className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-zerogreen to-purple-500 flex items-center justify-center text-6xl font-bold text-black">
                {userData.username[0].toUpperCase()}
              </div>
              <div className="flex-grow text-center md:text-left">
                <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                  <h1 className={`text-4xl font-bold text-white ${robotoMono.className}`}>
                    {userData.username}
                  </h1>
                  <span className="text-3xl">{userData.country}</span>
                </div>
                <p className="text-gray-400 mb-4">{userData.bio}</p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <Chip className="bg-yellow-500/20 text-yellow-400 font-bold">
                    🏆 Rank #{userData.rank}
                  </Chip>
                  <Chip className="bg-zerogreen/20 text-zerogreen font-bold">
                    {userData.totalPoints.toLocaleString()} Points
                  </Chip>
                  <Chip className="bg-blue-500/20 text-blue-400 font-bold">
                    {userData.totalSolves} Solves
                  </Chip>
                  <Chip className="bg-red-500/20 text-red-400 font-bold">
                    🩸 {userData.firstBloods} First Bloods
                  </Chip>
                  <Chip className="bg-orange-500/20 text-orange-400 font-bold">
                    🔥 {userData.streak} Day Streak
                  </Chip>
                </div>
              </div>
              <div className="text-center">
                <Button className="bg-zerogreen text-black font-bold hover:bg-zerogreen/90">
                  Edit Profile
                </Button>
                <p className="text-gray-500 text-sm mt-2">Joined {userData.joinedDate}</p>
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
              <h2 className={`text-2xl font-bold text-white mb-4 ${orbitron.className}`}>
                <span className="text-zerogreen">◆</span> Achievements
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {achievements.map((achievement, index) => (
                  <Card
                    key={index}
                    className="bg-[#0f0f0f] border border-zerogreen/30 hover:border-zerogreen hover:shadow-lg hover:shadow-zerogreen/20 transition-all duration-300"
                  >
                    <CardBody className="text-center p-4">
                      <div className="text-4xl mb-2">{achievement.icon}</div>
                      <h3 className="text-white font-bold text-sm mb-1">{achievement.title}</h3>
                      <p className="text-gray-500 text-xs">{achievement.description}</p>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h2 className={`text-2xl font-bold text-white mb-4 ${orbitron.className}`}>
                <span className="text-zerogreen">◆</span> Recent Solves
              </h2>
              <div className="space-y-3">
                {recentSolves.map((challenge) => (
                  <Card
                    key={challenge.id}
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
                            <Chip size="sm" variant="flat">{challenge.category}</Chip>
                            <Chip size="sm" color={difficultyColors[challenge.difficulty] as any}>
                              {challenge.difficulty}
                            </Chip>
                            <Chip size="sm" className="bg-zerogreen/20 text-zerogreen font-bold">
                              +{challenge.points} pts
                            </Chip>
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
            <h2 className={`text-2xl font-bold text-white mb-4 ${orbitron.className}`}>
              <span className="text-zerogreen">◆</span> All Solved Challenges ({userData.totalSolves})
            </h2>
            <div className="space-y-3">
              {recentSolves.map((challenge) => (
                <Card
                  key={challenge.id}
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
                          <Chip size="sm" variant="flat">{challenge.category}</Chip>
                          <Chip size="sm" color={difficultyColors[challenge.difficulty] as any}>
                            {challenge.difficulty}
                          </Chip>
                          <Chip size="sm" className="bg-zerogreen/20 text-zerogreen font-bold">
                            +{challenge.points} pts
                          </Chip>
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
              <h2 className={`text-2xl font-bold text-white mb-4 ${orbitron.className}`}>
                <span className="text-zerogreen">◆</span> Category Progress
              </h2>
              <div className="space-y-4">
                {categoryStats.map((stat, index) => (
                  <Card
                    key={index}
                    className="bg-[#0f0f0f] border border-gray-800 hover:border-zerogreen/50 transition-all duration-300"
                  >
                    <CardBody className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-bold">{stat.category}</span>
                        <span className="text-gray-400">
                          {stat.solved}/{stat.total} solved
                        </span>
                      </div>
                      <Progress
                        value={(stat.solved / stat.total) * 100}
                        className="h-2"
                        classNames={{
                          indicator: stat.color,
                        }}
                      />
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-[#0f0f0f] border border-zerogreen/30">
                <CardHeader className="pb-0">
                  <h3 className={`text-xl font-bold text-white ${orbitron.className}`}>
                    Performance Stats
                  </h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Average Solve Time</span>
                      <span className="text-white font-bold">2.5 hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Success Rate</span>
                      <span className="text-white font-bold">87%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Daily Average</span>
                      <span className="text-white font-bold">3 challenges</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Best Category</span>
                      <span className="text-white font-bold">Web</span>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card className="bg-[#0f0f0f] border border-zerogreen/30">
                <CardHeader className="pb-0">
                  <h3 className={`text-xl font-bold text-white ${orbitron.className}`}>
                    Ranking History
                  </h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Current Rank</span>
                      <span className="text-yellow-400 font-bold">#1</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Highest Rank</span>
                      <span className="text-white font-bold">#1</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Weekly Rank</span>
                      <span className="text-white font-bold">#2</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Monthly Rank</span>
                      <span className="text-white font-bold">#1</span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
