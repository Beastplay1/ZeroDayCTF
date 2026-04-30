"use client";
import { useEffect, useState } from "react";
import { Card, CardBody, Button, Input } from "@heroui/react";
import Link from "next/link";
import { Orbitron, Roboto_Mono } from "next/font/google";
import { useI18n } from "@/lib/i18n/context";

const orbitron = Orbitron({ subsets: ["latin"] });
const robotoMono = Roboto_Mono({ subsets: ["latin"] });

interface Team {
  id: string;
  name: string;
  tag: string;
  description: string;
  memberCount: number;
  totalPoints: number;
  totalSolves: number;
  avatarUrl?: string;
}

export default function TeamsPage() {
  const { t } = useI18n();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [userTeamId, setUserTeamId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", tag: "", description: "" });
  const [createError, setCreateError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" });
        const data = await res.json();
        setIsLoggedIn(Boolean(data.authenticated));
      } catch (e) {
        setIsLoggedIn(false);
      }
    };
    fetchSession();

    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        const data = await res.json();
        setUserTeamId(data.teamId || null);
      } catch {}
    };
    fetchProfile();
  }, []);

  const fetchTeams = async () => {
    try {
      const res = await fetch("/api/teams");
      const data = await res.json();
      setTeams(data.teams || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    setIsCreating(true);

    try {
      const res = await fetch("/api/teams/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();

      if (res.ok) {
        setShowCreateModal(false);
        setUserTeamId(data.teamId);
        fetchTeams(); // refresh list
      } else {
        setCreateError(data.error);
      }
    } catch (err) {
      setCreateError("Network error");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="text-center md:text-left">
            <h1 className={`text-5xl font-bold text-white mb-2 ${orbitron.className}`}>
              <span className="text-zerogreen">◆</span> {t("teamsPage.leaderboard")}
            </h1>
            <p className="text-gray-400 font-mono text-lg max-w-2xl">
              {t("teamsPage.subtitle")}
            </p>
          </div>
          
          {isLoggedIn && !userTeamId && (
            <Button
              className="bg-zerogreen text-black font-bold font-mono px-8 py-6 rounded-sm uppercase tracking-wider text-lg hover:bg-white transition-colors"
              onClick={() => setShowCreateModal(true)}
            >
              {t("teamsPage.createTeamBtn")}
            </Button>
          )}
          {isLoggedIn && userTeamId && (
            <Button
              as={Link}
              href={`/teams/${userTeamId}`}
              variant="bordered"
              className="border-zerogreen text-zerogreen font-bold font-mono px-8 py-6 rounded-sm uppercase tracking-wider text-lg hover:bg-zerogreen/10 transition-colors"
            >
              {t("teamsPage.myTeamBtn")}
            </Button>
          )}
        </div>

        {/* Create Team Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="bg-[#0f0f0f] border-2 border-zerogreen/50 p-8 max-w-md w-full relative">
              <button 
                onClick={() => setShowCreateModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white"
              >
                ✕
              </button>
              <h2 className={`text-2xl font-bold text-white mb-6 ${orbitron.className}`}>
                {t("teamsPage.createTeamTitle")}
              </h2>
              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div>
                  <label className="block text-sm font-mono text-gray-400 mb-1">{t("teamsPage.teamNameLabel")}</label>
                  <input
                    type="text"
                    required
                    maxLength={32}
                    value={createForm.name}
                    onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                    className="w-full bg-black border border-gray-700 text-white px-4 py-2 font-mono focus:border-zerogreen outline-none"
                    placeholder={t("teamsPage.teamNamePlaceholder")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-mono text-gray-400 mb-1">{t("teamsPage.teamTagLabel")}</label>
                  <input
                    type="text"
                    required
                    maxLength={8}
                    value={createForm.tag}
                    onChange={(e) => setCreateForm({...createForm, tag: e.target.value.toUpperCase()})}
                    className="w-full bg-black border border-gray-700 text-white px-4 py-2 font-mono focus:border-zerogreen outline-none uppercase"
                    placeholder={t("teamsPage.teamTagPlaceholder")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-mono text-gray-400 mb-1">{t("teamsPage.descriptionLabel")}</label>
                  <textarea
                    maxLength={100}
                    value={createForm.description}
                    onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                    className="w-full bg-black border border-gray-700 text-white px-4 py-2 font-mono focus:border-zerogreen outline-none resize-none h-24"
                    placeholder={t("teamsPage.descriptionPlaceholder")}
                  />
                </div>
                {createError && <div className="text-red-500 font-mono text-sm">{createError}</div>}
                <Button
                  type="submit"
                  disabled={isCreating}
                  className="w-full bg-zerogreen text-black font-bold font-mono"
                >
                  {isCreating ? t("teamsPage.creating") : t("teamsPage.create")}
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Teams List */}
        {loading ? (
          <div className="text-center text-gray-500 font-mono py-12">{t("teamsPage.loadingTeams")}</div>
        ) : teams.length === 0 ? (
          <div className="text-center text-gray-500 font-mono py-12">{t("teamsPage.noTeams")}</div>
        ) : (
          <div className="grid gap-4">
            {teams.map((team, index) => (
              <Link key={team.id} href={`/teams/${team.id}`}>
                <Card className="bg-[#0f0f0f] border border-gray-800 hover:border-zerogreen/50 transition-colors">
                  <CardBody className="p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-6">
                    <div className="flex items-center justify-center w-12 h-12 flex-shrink-0 text-2xl font-bold font-mono text-gray-600">
                      #{index + 1}
                    </div>
                    <div className={`w-16 h-16 rounded flex items-center justify-center text-2xl font-bold overflow-hidden border border-zerogreen/30 ${team.avatarUrl ? "bg-transparent" : "bg-gradient-to-br from-zerogreen/20 to-purple-500/20 text-white"}`}>
                      {team.avatarUrl ? (
                        <img src={team.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        team.name[0]?.toUpperCase()
                      )}
                    </div>
                    <div className="flex-grow text-center sm:text-left">
                      <h2 className={`text-xl font-bold text-white ${robotoMono.className}`}>
                        {team.name} <span className="text-gray-500 text-lg">[{team.tag}]</span>
                      </h2>
                      <p className="text-gray-400 text-sm mt-1 max-w-lg truncate">{team.description}</p>
                    </div>
                    <div className="flex gap-6 mt-4 sm:mt-0 font-mono">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-zerogreen">{team.totalPoints}</div>
                        <div className="text-xs text-gray-500 uppercase">{t("teamsPage.points")}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{team.memberCount}</div>
                        <div className="text-xs text-gray-500 uppercase">{t("teamsPage.members")}</div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
