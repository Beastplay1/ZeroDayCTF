"use client";
import { useState } from "react";
import { Card, CardBody, CardHeader, Chip, Button } from "@heroui/react";
import { Orbitron } from "next/font/google";

const orbitron = Orbitron({ subsets: ["latin"] });

interface Challenge {
  id: number;
  name: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Insane";
  points: number;
  solves: number;
  firstBlood?: string;
  description: string;
}

const sevenDayChallenges: Challenge[] = [
  { id: 1, name: "SQL Injection Master", category: "Web", difficulty: "Medium", points: 300, solves: 145, firstBlood: "h4x0r_elite", description: "Find the flag in the database" },
  { id: 2, name: "RSA Decrypt", category: "Crypto", difficulty: "Hard", points: 500, solves: 67, firstBlood: "crypto_king", description: "Break the RSA encryption" },
  { id: 3, name: "Buffer Overflow Basic", category: "Pwn", difficulty: "Easy", points: 200, solves: 234, firstBlood: "pwn_master", description: "Exploit the binary" },
  { id: 4, name: "Reverse Me", category: "Reverse Engineering", difficulty: "Medium", points: 350, solves: 89, firstBlood: "rev_god", description: "Find the hidden algorithm" },
  { id: 5, name: "Forensics Hunt", category: "Forensics", difficulty: "Easy", points: 150, solves: 312, firstBlood: "forensic_eye", description: "Analyze the memory dump" },
  { id: 6, name: "XSS Paradise", category: "Web", difficulty: "Hard", points: 450, solves: 45, firstBlood: "xss_ninja", description: "Bypass all filters" },
  { id: 7, name: "Blockchain Explorer", category: "Crypto", difficulty: "Insane", points: 800, solves: 12, firstBlood: "chain_breaker", description: "Find the vulnerability in smart contract" },
];

const uniqueChallenges: Challenge[] = [
  { id: 101, name: "Zero-Day Hunt", category: "Web", difficulty: "Insane", points: 1000, solves: 5, description: "Find the 0-day vulnerability in the custom CMS" },
];

export default function Challenges() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");

  const categories = ["All", "Web", "Crypto", "Pwn", "Reverse Engineering", "Forensics", "Binary", "Mobile", "Hardware", "OSINT", "Misc", "Red Team", "Blue Team", "Cloud"];
  const difficulties = ["All", "Easy", "Medium", "Hard", "Insane"];

  const difficultyColors = {
    Easy: "success",
    Medium: "warning",
    Hard: "danger",
    Insane: "secondary"
  };

  const categoryColors: Record<string, string> = {
    Web: "bg-blue-500/20 text-blue-400 border-blue-500/50",
    Crypto: "bg-purple-500/20 text-purple-400 border-purple-500/50",
    Pwn: "bg-red-500/20 text-red-400 border-red-500/50",
    "Reverse Engineering": "bg-orange-500/20 text-orange-400 border-orange-500/50",
    Forensics: "bg-cyan-500/20 text-cyan-400 border-cyan-500/50",
    Binary: "bg-pink-500/20 text-pink-400 border-pink-500/50",
    Mobile: "bg-green-500/20 text-green-400 border-green-500/50",
    Hardware: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
    OSINT: "bg-indigo-500/20 text-indigo-400 border-indigo-500/50",
    Misc: "bg-gray-500/20 text-gray-400 border-gray-500/50",
    "Red Team": "bg-red-600/20 text-red-500 border-red-600/50",
    "Blue Team": "bg-blue-600/20 text-blue-500 border-blue-600/50",
    Cloud: "bg-sky-500/20 text-sky-400 border-sky-500/50",
  };

  const filterChallenges = (challenges: Challenge[]) => {
    return challenges.filter(challenge => {
      const categoryMatch = selectedCategory === "All" || challenge.category === selectedCategory;
      const difficultyMatch = selectedDifficulty === "All" || challenge.difficulty === selectedDifficulty;
      return categoryMatch && difficultyMatch;
    });
  };

  const ChallengeCard = ({ challenge, isUnique = false }: { challenge: Challenge; isUnique?: boolean }) => (
    <Card className="bg-[#0f0f0f] border border-zerogreen/30 hover:border-zerogreen hover:shadow-lg hover:shadow-zerogreen/20 transition-all duration-300 group">
      <CardHeader className="flex flex-col items-start gap-2 pb-2">
        <div className="flex justify-between items-start w-full">
          <h3 className={`text-lg font-bold text-white group-hover:text-zerogreen transition-colors ${orbitron.className}`}>
            {challenge.name}
          </h3>
          <Chip 
            size="sm" 
            color={difficultyColors[challenge.difficulty] as any}
            variant="flat"
            className="font-bold"
          >
            {challenge.difficulty}
          </Chip>
        </div>
        <div className="flex gap-2 flex-wrap">
          <span className={`text-xs px-2 py-1 rounded border ${categoryColors[challenge.category]}`}>
            {challenge.category}
          </span>
          <span className="text-xs px-2 py-1 rounded bg-zerogreen/20 text-zerogreen border border-zerogreen/50 font-bold">
            {challenge.points} pts
          </span>
        </div>
      </CardHeader>
      <CardBody className="pt-0">
        <p className="text-gray-400 text-sm mb-3">{challenge.description}</p>
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            <span className="text-cyan-400 font-bold">{challenge.solves}</span> solves
          </div>
          {challenge.firstBlood && (
            <div className="text-xs text-red-400 font-bold flex items-center gap-1">
              <span className="animate-pulse">🩸</span> {challenge.firstBlood}
            </div>
          )}
        </div>
        <Button 
          className="mt-3 w-full bg-zerogreen/10 border border-zerogreen hover:bg-zerogreen hover:text-black transition-all duration-300 text-zerogreen font-bold"
          variant="bordered"
        >
          View Challenge
        </Button>
      </CardBody>
    </Card>
  );

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className={`text-5xl font-bold text-white mb-4 ${orbitron.className}`}>
            <span className="text-zerogreen">{'>'}</span> Challenges
          </h1>
          <p className="text-gray-400 text-lg">Test your skills against real CTF challenges</p>
        </div>

        <div className="mb-8 flex flex-wrap gap-4 justify-center">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                size="sm"
                className={`${
                  selectedCategory === cat
                    ? "bg-zerogreen text-black"
                    : "bg-[#0f0f0f] text-gray-400 border border-gray-700 hover:border-zerogreen"
                } transition-all duration-300`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        <div className="mb-8 flex flex-wrap gap-2 justify-center">
          {difficulties.map((diff) => (
            <Button
              key={diff}
              size="sm"
              className={`${
                selectedDifficulty === diff
                  ? "bg-zerogreen text-black"
                  : "bg-[#0f0f0f] text-gray-400 border border-gray-700 hover:border-zerogreen"
              } transition-all duration-300`}
              onClick={() => setSelectedDifficulty(diff)}
            >
              {diff}
            </Button>
          ))}
        </div>

        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-grow bg-gradient-to-r from-transparent via-zerogreen to-transparent"></div>
            <h2 className={`text-3xl font-bold text-white ${orbitron.className}`}>
              <span className="text-zerogreen animate-pulse">◆</span> 7-Day Challenges
            </h2>
            <div className="h-px flex-grow bg-gradient-to-r from-transparent via-zerogreen to-transparent"></div>
          </div>
          <p className="text-center text-gray-400 mb-6">
            These challenges run for 7 days. <span className="text-red-400 font-bold">First blood gets bonus points!</span>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterChallenges(sevenDayChallenges).map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
          {filterChallenges(sevenDayChallenges).length === 0 && (
            <div className="text-center text-gray-500 py-12">
              No challenges found for the selected filters
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-grow bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
            <h2 className={`text-3xl font-bold text-white ${orbitron.className}`}>
              <span className="text-purple-400 animate-pulse">★</span> 24-Hour Unique Challenges
            </h2>
            <div className="h-px flex-grow bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
          </div>
          <p className="text-center text-gray-400 mb-6">
            Special challenges refreshed every 24 hours. <span className="text-yellow-400 font-bold">Top 3 get bonus points: 1st (+500), 2nd (+250), 3rd (+50)</span>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterChallenges(uniqueChallenges).map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} isUnique={true} />
            ))}
          </div>
          {filterChallenges(uniqueChallenges).length === 0 && (
            <div className="text-center text-gray-500 py-12">
              No challenges found for the selected filters
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
