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
  file?: string;
}

const sevenDayChallenges: Challenge[] = [
  {
    id: 1,
    name: "Classically",
    category: "Crypto",
    difficulty: "Easy",
    points: 50,
    solves: 0,
    description: "Do you think you can solve this classically?",
    file: "classically.zip",
  },
];

const uniqueChallenges: Challenge[] = [];

export default function Challenges() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(
    null,
  );
  const [flagInput, setFlagInput] = useState("");
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "correct" | "wrong"
  >("idle");

  const categories = [
    "All",
    "Web",
    "Crypto",
    "Pwn",
    "Reverse Engineering",
    "Forensics",
    "Binary",
    "OSINT",
    "Misc",
  ];
  const difficulties = ["All", "Easy", "Medium", "Hard", "Insane"];

  const difficultyColors = {
    Easy: "success",
    Medium: "warning",
    Hard: "danger",
    Insane: "secondary",
  };

  const categoryColors: Record<string, string> = {
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

  const filterChallenges = (challenges: Challenge[]) =>
    challenges.filter((c) => {
      const catOk =
        selectedCategory === "All" || c.category === selectedCategory;
      const diffOk =
        selectedDifficulty === "All" || c.difficulty === selectedDifficulty;
      return catOk && diffOk;
    });

  const openChallenge = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setFlagInput("");
    setSubmitStatus("idle");
  };

  const closeModal = () => {
    setSelectedChallenge(null);
    setFlagInput("");
    setSubmitStatus("idle");
  };

  const handleFlagSubmit = () => {
    // Placeholder — will wire to API later
    if (flagInput.trim() === "") return;
    setSubmitStatus("wrong");
  };

  const ChallengeCard = ({ challenge }: { challenge: Challenge }) => (
    <Card
      className="bg-[#0f0f0f] border border-zerogreen/30 hover:border-zerogreen hover:shadow-lg hover:shadow-zerogreen/20 transition-all duration-300 group cursor-pointer"
      isPressable
      onPress={() => openChallenge(challenge)}
    >
      <CardHeader className="flex flex-col items-start gap-2 pb-2">
        <div className="flex justify-between items-start w-full">
          <h3
            className={`text-lg font-bold text-white group-hover:text-zerogreen transition-colors ${orbitron.className}`}
          >
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
          <span
            className={`text-xs px-2 py-1 rounded border ${categoryColors[challenge.category]}`}
          >
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
            <span className="text-cyan-400 font-bold">{challenge.solves}</span>{" "}
            solves
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
          onPress={() => openChallenge(challenge)}
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
          <h1
            className={`text-5xl font-bold text-white mb-4 ${orbitron.className}`}
          >
            <span className="text-zerogreen">{">"}</span> Challenges
          </h1>
          <p className="text-gray-400 text-lg">
            Test your skills against real CTF challenges
          </p>
        </div>

        <div className="mb-8 flex flex-wrap gap-4 justify-center">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                size="sm"
                className={`${selectedCategory === cat ? "bg-zerogreen text-black" : "bg-[#0f0f0f] text-gray-400 border border-gray-700 hover:border-zerogreen"} transition-all duration-300`}
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
              className={`${selectedDifficulty === diff ? "bg-zerogreen text-black" : "bg-[#0f0f0f] text-gray-400 border border-gray-700 hover:border-zerogreen"} transition-all duration-300`}
              onClick={() => setSelectedDifficulty(diff)}
            >
              {diff}
            </Button>
          ))}
        </div>

        {/* 7-Day Challenges */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-grow bg-gradient-to-r from-transparent via-zerogreen to-transparent"></div>
            <h2
              className={`text-3xl font-bold text-white ${orbitron.className}`}
            >
              <span className="text-zerogreen animate-pulse">◆</span> 7-Day
              Challenges
            </h2>
            <div className="h-px flex-grow bg-gradient-to-r from-transparent via-zerogreen to-transparent"></div>
          </div>
          <p className="text-center text-gray-400 mb-6">
            These challenges run for 7 days.{" "}
            <span className="text-red-400 font-bold">
              First blood gets bonus points!
            </span>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterChallenges(sevenDayChallenges).map((c) => (
              <ChallengeCard key={c.id} challenge={c} />
            ))}
          </div>
          {filterChallenges(sevenDayChallenges).length === 0 && (
            <div className="text-center text-gray-500 py-12">
              No challenges found for the selected filters
            </div>
          )}
        </div>

        {/* 24-Hour Bonus Challenges */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-grow bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
            <h2
              className={`text-3xl font-bold text-white ${orbitron.className}`}
            >
              <span className="text-purple-400 animate-pulse">★</span> 24-Hour
              Bonus Challenges
            </h2>
            <div className="h-px flex-grow bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
          </div>
          <p className="text-center text-gray-400 mb-6">
            Special challenges refreshed every 24 hours.{" "}
            <span className="text-yellow-400 font-bold">
              Top 3 get bonus points: 1st (+500), 2nd (+250), 3rd (+50)
            </span>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterChallenges(uniqueChallenges).map((c) => (
              <ChallengeCard key={c.id} challenge={c} />
            ))}
          </div>
          {filterChallenges(uniqueChallenges).length === 0 && (
            <div className="text-center text-gray-500 py-12">
              No active bonus challenges right now
            </div>
          )}
        </div>
      </div>

      {/* Challenge Modal */}
      {selectedChallenge && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-lg bg-[#0a0a0a] border border-zerogreen/50 shadow-2xl shadow-zerogreen/10 rounded-sm"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-zerogreen/20">
              <div className="flex-1 pr-4">
                <h2
                  className={`text-2xl font-bold text-white mb-2 ${orbitron.className}`}
                >
                  {selectedChallenge.name}
                </h2>
                <div className="flex gap-2 flex-wrap">
                  <span
                    className={`text-xs px-2 py-1 rounded border ${categoryColors[selectedChallenge.category]}`}
                  >
                    {selectedChallenge.category}
                  </span>
                  <Chip
                    size="sm"
                    color={
                      difficultyColors[selectedChallenge.difficulty] as any
                    }
                    variant="flat"
                    className="font-bold"
                  >
                    {selectedChallenge.difficulty}
                  </Chip>
                  <span className="text-xs px-2 py-1 rounded bg-zerogreen/20 text-zerogreen border border-zerogreen/50 font-bold">
                    {selectedChallenge.points} pts
                  </span>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-white transition-colors text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              <p className="text-gray-300 text-sm leading-relaxed">
                {selectedChallenge.description}
              </p>

              <div className="flex gap-4 text-sm text-gray-500">
                <span>
                  Solves:{" "}
                  <span className="text-cyan-400 font-bold">
                    {selectedChallenge.solves}
                  </span>
                </span>
                {selectedChallenge.firstBlood && (
                  <span className="text-red-400">
                    🩸 First blood:{" "}
                    <span className="font-bold">
                      {selectedChallenge.firstBlood}
                    </span>
                  </span>
                )}
              </div>

              {/* Download button */}
              {selectedChallenge.file && (
                <a
                  href={`/api/challenges/download?path=${encodeURIComponent(`${selectedChallenge.category}/${selectedChallenge.name}/${selectedChallenge.file}`)}`}
                  download={selectedChallenge.file}
                  className="block w-full py-2 border border-zerogreen/40 text-zerogreen/70 font-mono text-sm hover:border-zerogreen hover:text-zerogreen transition-all duration-200 text-center"
                >
                  ↓ {selectedChallenge.file}
                </a>
              )}

              {/* Flag input */}
              <div className="space-y-2">
                <input
                  type="text"
                  value={flagInput}
                  onChange={(e) => {
                    setFlagInput(e.target.value);
                    setSubmitStatus("idle");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleFlagSubmit()}
                  placeholder="zeroday{...}"
                  className="w-full bg-black border border-gray-700 focus:border-zerogreen outline-none px-4 py-2 text-white font-mono text-sm placeholder:text-gray-600 transition-colors"
                />
                {submitStatus === "correct" && (
                  <p className="text-green-400 font-mono text-xs">
                    ✓ Correct flag!
                  </p>
                )}
                {submitStatus === "wrong" && (
                  <p className="text-red-400 font-mono text-xs">
                    ✗ Wrong flag. Try again.
                  </p>
                )}
                <button
                  onClick={handleFlagSubmit}
                  className="w-full py-2 bg-zerogreen/10 border border-zerogreen text-zerogreen font-bold font-mono text-sm hover:bg-zerogreen hover:text-black transition-all duration-200"
                >
                  SUBMIT FLAG
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
