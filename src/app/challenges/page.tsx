"use client";
import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Chip, Button } from "@heroui/react";
import { Orbitron } from "next/font/google";
import { useI18n } from "@/lib/i18n/context";

const orbitron = Orbitron({ subsets: ["latin"] });

interface Challenge {
  mongoId: string;
  name: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Insane";
  points: number;
  solves: number;
  firstBlood?: string;
  description: string;
  file?: string;
  type: "weekly" | "daily";
  expiresAt?: string;
}

const sevenDayChallenges: Challenge[] = [];
const uniqueChallenges: Challenge[] = [];

export default function Challenges() {
  const { t } = useI18n();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [weeklyChallenges, setWeeklyChallenges] =
    useState<Challenge[]>(sevenDayChallenges);
  const [dailyChallenges, setDailyChallenges] =
    useState<Challenge[]>(uniqueChallenges);
  const [loadingChallenges, setLoadingChallenges] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(
    null,
  );
  const [flagInput, setFlagInput] = useState("");
  const [submitStatus, setSubmitStatus] = useState<
    | "idle"
    | "correct"
    | "wrong"
    | "already_solved"
    | "loading"
    | "unauthenticated"
    | "guest_restricted"
    | "invalid_format"
  >("idle");
  const [showGuestCTA, setShowGuestCTA] = useState(false);
  const [isGuest, setIsGuest] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hints, setHints] = useState<{ index: number; cost: number; content: string | null; isUnlocked: boolean }[]>([]);
  const [loadingHints, setLoadingHints] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "hints">("description");

  useEffect(() => {
    // Initialize guest session for anonymous users (safe no-op for logged-in users).
    fetch("/api/guest/ensure", { method: "POST" })
      .then(r => r.json())
      .then(data => {
        setIsAuthenticated(data.mode === "user");
        setIsGuest(data.mode === "guest");
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/challenges")
      .then((r) => r.json())
      .then((data) => {
        const all: Challenge[] = (data.challenges ?? []).map((c: any) => ({
          mongoId: c._id,
          name: c.name,
          category: c.category,
          difficulty: c.difficulty,
          points: c.points,
          solves: c.solves,
          firstBlood: c.firstBlood,
          description: c.description,
          file: c.file,
          type: c.type,
          expiresAt: c.expiresAt,
        }));
        
        // Filter out expired challenges globally
        const activeAll = all.filter((c) => {
          if (!c.expiresAt) return true;
          return new Date() <= new Date(c.expiresAt);
        });

        setWeeklyChallenges(activeAll.filter((c) => c.type === "weekly"));
        setDailyChallenges(activeAll.filter((c) => c.type === "daily"));
      })
      .catch(() => {})
      .finally(() => setLoadingChallenges(false));
  }, []);

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

  const difficultyChipColors: Record<string, string> = {
    Easy: "bg-green-500/20 text-green-400 border-green-500/50",
    Medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
    Hard: "bg-red-500/20 text-red-400 border-red-500/50",
    Insane: "bg-purple-500/20 text-purple-400 border-purple-500/50",
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
    setActiveTab("description");
    fetchHints(challenge.mongoId);
  };

  const fetchHints = async (challengeId: string) => {
    setLoadingHints(true);
    try {
      const res = await fetch(`/api/challenges/${challengeId}/hints`);
      const data = await res.json();
      setHints(data.hints || []);
    } catch (err) {
      console.error("Failed to fetch hints:", err);
    } finally {
      setLoadingHints(false);
    }
  };

  const [hintError, setHintError] = useState<string | null>(null);

  const unlockHint = async (hintIndex: number) => {
    if (!selectedChallenge) return;
    setHintError(null);
    try {
      const res = await fetch(`/api/challenges/${selectedChallenge.mongoId}/hints/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hintIndex })
      });
      const data = await res.json();
      if (data.success) {
        // Refresh hints
        fetchHints(selectedChallenge.mongoId);
      } else {
        setHintError(data.error || "Failed to unlock hint");
      }
    } catch (err) {
      setHintError("Failed to unlock hint");
    }
  };

  const closeModal = () => {
    setSelectedChallenge(null);
    setFlagInput("");
    setSubmitStatus("idle");
  };

  const handleFlagSubmit = async () => {
    const trimmed = flagInput.trim();
    if (!trimmed || !selectedChallenge?.mongoId) return;

    if (!/^zerodayctf\{.+\}$/.test(trimmed)) {
      setSubmitStatus("invalid_format");
      return;
    }

    setSubmitStatus("loading");
    try {
      const res = await fetch(
        `/api/challenges/${selectedChallenge.mongoId}/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ flag: trimmed }),
        },
      );
      const data = await res.json();
      if (res.status === 401) {
        setSubmitStatus(
          data?.result === "guest_restricted"
            ? "guest_restricted"
            : "unauthenticated",
        );
        return;
      }
      if (data.result === "correct") {
        setSubmitStatus("correct");
        if (data.anonymous) {
          setTimeout(() => {
            setShowGuestCTA(true);
            closeModal();
          }, 600);
        }
      } else {
        setSubmitStatus(
          data.result === "already_solved" ? "already_solved" : "wrong",
        );
      }
    } catch {
      setSubmitStatus("wrong");
    }
  };

  const ChallengeTimer = ({ expiresAt }: { expiresAt?: string }) => {
    const [timeLeft, setTimeLeft] = useState<string>("");

    useEffect(() => {
      if (!expiresAt) return;
      const interval = setInterval(() => {
        const diff = new Date(expiresAt).getTime() - new Date().getTime();
        if (diff <= 0) {
          setTimeLeft("Expired");
          clearInterval(interval);
          return;
        }
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / 1000 / 60) % 60);
        const s = Math.floor((diff / 1000) % 60);
        setTimeLeft(`${d > 0 ? d + "d " : ""}${h}h ${m}m ${s}s`);
      }, 1000);
      return () => clearInterval(interval);
    }, [expiresAt]);

    if (!expiresAt || !timeLeft) return null;

    return (
      <div className="text-xs flex items-center gap-1 bg-black/40 px-2 py-1 rounded border border-gray-700/50 text-gray-300 font-mono">
        <span className="text-yellow-500">⏱</span> {timeLeft}
      </div>
    );
  };

  const ChallengeCard = ({ challenge }: { challenge: Challenge }) => (
    <Card
      className="bg-[#0f0f0f] border border-zerogreen/30 hover:border-zerogreen hover:shadow-lg hover:shadow-zerogreen/20 transition-all duration-300 group cursor-pointer h-full"
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
          <span
            className={`text-xs px-2 py-1 rounded border ${difficultyChipColors[challenge.difficulty] ?? "bg-gray-500/20 text-gray-400 border-gray-500/50"} font-bold`}
          >
            {challenge.difficulty}
          </span>
        </div>
        <div className="flex justify-between items-center w-full mt-1">
          <div className="flex gap-2 flex-wrap">
            <span
              className={`text-xs px-2 py-1 rounded border ${categoryColors[challenge.category]} font-bold`}
            >
              {challenge.category}
            </span>
            <span className="text-xs px-2 py-1 rounded bg-zerogreen/20 text-zerogreen border border-zerogreen/50 font-bold">
              {challenge.points} pts
            </span>
          </div>
          <ChallengeTimer expiresAt={challenge.expiresAt} />
        </div>
      </CardHeader>
      <CardBody className="pt-0 flex flex-col h-full">
        <p className="text-gray-400 text-sm mb-3 overflow-hidden max-h-[40px] [mask-image:linear-gradient(to_bottom,white_20px,transparent_40px)] [-webkit-mask-image:linear-gradient(to_bottom,white_20px,transparent_40px)]">
          {challenge.description}
        </p>
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {challenge.solves}{" "}
            {t("challenges.solves")}
          </div>
          {challenge.firstBlood && (
            <div className="text-xs text-red-400 font-bold flex items-center gap-1">
              <span className="animate-pulse">🩸</span> {challenge.firstBlood}
            </div>
          )}
        </div>
        <div className="mt-auto pt-4 w-full">
          <div className="w-full bg-zerogreen/10 border border-zerogreen text-zerogreen font-bold text-center py-2 text-sm rounded-xl group-hover:bg-zerogreen group-hover:text-black transition-all duration-300">
            {t("challenges.viewChallenge")}
          </div>
        </div>
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
            <span className="text-zerogreen">{">"}</span> {t("challenges.title")}
          </h1>
          <p className="text-gray-400 text-lg">
            {t("challenges.subtitle")}
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
              <span className="text-zerogreen animate-pulse">◆</span> {t("challenges.weeklyTitle")}
            </h2>
            <div className="h-px flex-grow bg-gradient-to-r from-transparent via-zerogreen to-transparent"></div>
          </div>
          <p className="text-center text-gray-400 mb-6">
            {t("challenges.weeklyDesc")}{" "}
            <span className="text-red-400 font-bold">
              {t("challenges.weeklyFirstBlood")}
            </span>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingChallenges
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-48 bg-[#0f0f0f] border border-zerogreen/10 animate-pulse rounded-sm"
                  />
                ))
              : filterChallenges(weeklyChallenges).map((c) => (
                  <ChallengeCard key={c.mongoId} challenge={c} />
                ))}
          </div>
          {!loadingChallenges &&
            filterChallenges(weeklyChallenges).length === 0 && (
              <div className="text-center text-gray-500 py-12">
              {t("challenges.noResults")}
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
              <span className="text-purple-400 animate-pulse">★</span> {t("challenges.dailyTitle")}
            </h2>
            <div className="h-px flex-grow bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
          </div>
          <p className="text-center text-gray-400 mb-6">
            {t("challenges.dailyDesc")}{" "}
            <span className="text-yellow-400 font-bold">
              {t("challenges.dailyBonus")}
            </span>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingChallenges
              ? null
              : filterChallenges(dailyChallenges).map((c) => (
                  <ChallengeCard key={c.mongoId} challenge={c} />
                ))}
          </div>
          {!loadingChallenges &&
            filterChallenges(dailyChallenges).length === 0 && (
              <div className="text-center text-gray-500 py-12">
              {t("challenges.noBonus")}
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
                    className={`text-xs px-2 py-1 rounded border ${categoryColors[selectedChallenge.category]} font-bold`}
                  >
                    {selectedChallenge.category}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded border ${difficultyChipColors[selectedChallenge.difficulty] ?? "bg-gray-500/20 text-gray-400 border-gray-500/50"} font-bold`}
                  >
                    {selectedChallenge.difficulty}
                  </span>
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

            {/* Tabs */}
            <div className="flex border-b border-zerogreen/20">
              <button
                onClick={() => setActiveTab("description")}
                className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === "description" ? "text-zerogreen bg-zerogreen/5 border-b-2 border-zerogreen" : "text-gray-500 hover:text-gray-300"}`}
              >
                {t("challenges.description")}
              </button>
              <button
                onClick={() => setActiveTab("hints")}
                className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === "hints" ? "text-zerogreen bg-zerogreen/5 border-b-2 border-zerogreen" : "text-gray-500 hover:text-gray-300"}`}
              >
                {t("challenges.hints")} ({hints.length})
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {activeTab === "description" ? (
                <>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {selectedChallenge.description}
                  </p>
                </>
              ) : (
                <div className="space-y-4 min-h-[100px]">
                  {loadingHints ? (
                    <div className="text-center py-4 animate-pulse text-gray-500 font-mono text-sm">
                      {t("challenges.loadingHints")}
                    </div>
                  ) : hints.length === 0 ? (
                    <div className="text-center py-4 text-gray-600 italic text-sm">
                      {t("challenges.noHints")}
                    </div>
                  ) : (
                    <>
                      {hintError && (
                        <div className="p-2 bg-red-500/20 border border-red-500 text-red-500 text-xs font-mono rounded-sm text-center">
                          {hintError}
                        </div>
                      )}
                      {hints.map((hint) => (
                        <div key={hint.index} className="border border-zerogreen/20 bg-black/40 p-4 rounded-sm">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-zerogreen/60 uppercase">Hint #{hint.index + 1}</span>
                            {!hint.isUnlocked && (
                              <span className="text-xs font-bold text-yellow-500/80">-{hint.cost} PTS</span>
                            )}
                          </div>
                          {hint.isUnlocked ? (
                            <p className="text-gray-200 text-sm font-mono whitespace-pre-wrap">{hint.content}</p>
                          ) : (
                            <div className="space-y-2">
                              <button
                                onClick={() => {
                                  if (!isAuthenticated) return;
                                  unlockHint(hint.index);
                                }}
                                disabled={!isAuthenticated}
                                className="w-full py-2 bg-yellow-500/10 border border-yellow-500/50 text-yellow-500 font-bold text-xs hover:bg-yellow-500 hover:text-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {t("challenges.unlockHint", { cost: hint.cost })}
                              </button>
                              {!isAuthenticated && (
                                <p className="text-[10px] text-yellow-500/70 text-center font-mono italic">
                                  {t("challenges.signInForHints")}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}


              <div className="flex gap-4 text-sm text-gray-500">
                <span>
                  {t("challenges.solves")}:{" "}
                  <span className="text-cyan-400 font-bold">{selectedChallenge.solves}</span>
                </span>
                {selectedChallenge.firstBlood && (
                  <span className="text-red-400">
                    🩸 {t("challenges.firstBlood")}:{" "}
                    <span className="font-bold">{selectedChallenge.firstBlood}</span>
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
                    if (
                      submitStatus !== "correct" &&
                      submitStatus !== "already_solved"
                    ) {
                      setSubmitStatus("idle");
                    }
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleFlagSubmit()}
                  placeholder={t("challenges.placeholder")}
                  className="w-full bg-black border border-gray-700 focus:border-zerogreen outline-none px-4 py-2 text-white font-mono text-sm placeholder:text-gray-600 transition-colors"
                />
                {submitStatus === "correct" && (
                  <p className="text-green-400 font-mono text-xs">
                    {t("challenges.correct")}
                  </p>
                )}
                {submitStatus === "wrong" && (
                  <p className="text-red-400 font-mono text-xs">{t("challenges.incorrect")}</p>
                )}
                {submitStatus === "already_solved" && (
                  <p className="text-yellow-400 font-mono text-xs">{t("challenges.alreadySolved")}</p>
                )}
                {submitStatus === "invalid_format" && (
                  <p className="text-orange-400 font-mono text-xs">{t("challenges.invalidFormat")}</p>
                )}
                {submitStatus === "unauthenticated" && (
                  <p className="text-yellow-400 font-mono text-xs">
                    ⚠ {t("challenges.mustSignIn")}{" "}
                    <a href="/signin" className="underline hover:text-yellow-300">
                      {t("challenges.signedIn")}
                    </a>{" "}
                    {t("challenges.toSubmit")}
                  </p>
                )}
                {submitStatus === "guest_restricted" && (
                  <p className="text-yellow-400 font-mono text-xs">
                    ⚠ {t("challenges.guestRestricted")}{" "}
                    <a href="/signup" className="underline hover:text-yellow-300">
                      {t("challenges.signUpTo")}
                    </a>{" "}
                    {t("challenges.toSubmitDaily")}
                  </p>
                )}
                <button
                  onClick={handleFlagSubmit}
                  disabled={submitStatus === "loading"}
                  className="w-full py-2 bg-zerogreen/10 border border-zerogreen text-zerogreen font-bold font-mono text-sm hover:bg-zerogreen hover:text-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitStatus === "loading" ? t("challenges.checking") : t("challenges.submit")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guest CTA Modal */}
      {showGuestCTA && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setShowGuestCTA(false)}
        >
          <div
            className="relative w-full max-w-md bg-[#0a0a0a] border-2 border-zerogreen shadow-[0_0_50px_rgba(0,255,0,0.15)] rounded-lg text-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top decorative bar */}
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-zerogreen to-transparent"></div>
            
            <div className="p-8">
              <div className="text-5xl mb-4 animate-bounce">🎉</div>
              <h2
                className={`text-2xl font-bold text-white mb-4 ${orbitron.className}`}
              >
                {t("challenges.guestSolvedTitle")}
              </h2>
              <p className="text-gray-300 text-sm leading-relaxed mb-6">
                {t("challenges.guestSolvedDesc")}
              </p>
              
              <div className="flex flex-col gap-3">
                <a
                  href="/signup"
                  className="w-full py-3 bg-zerogreen text-black font-bold font-mono text-sm hover:bg-green-400 transition-colors rounded-sm shadow-[0_0_15px_rgba(0,255,0,0.3)]"
                >
                  {t("challenges.signUpNow")}
                </a>
                <button
                  onClick={() => setShowGuestCTA(false)}
                  className="w-full py-2 text-gray-500 hover:text-white font-mono text-xs transition-colors"
                >
                  {t("challenges.continueAsGuest")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
