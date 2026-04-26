"use client";
import { useEffect, useState, use } from "react";
import { Card, CardBody, Button } from "@heroui/react";
import Link from "next/link";
import { Orbitron, Roboto_Mono } from "next/font/google";
import { UserSearch } from "@/components/UserSearch";

const orbitron = Orbitron({ subsets: ["latin"] });
const robotoMono = Roboto_Mono({ subsets: ["latin"] });

export default function TeamDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const teamId = unwrappedParams.id;
  
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sessionUser, setSessionUser] = useState<any>(null);

  // Invite modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedUserToInvite, setSelectedUserToInvite] = useState<{ id: string | number; username: string; userTag?: string } | null>(null);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  // Leave / Disband state
  const [isLeaving, setIsLeaving] = useState(false);
  const [isDisbanding, setIsDisbanding] = useState(false);

  // Apply to join state
  const [ isApplying, setIsApplying] = useState(false);
  const [applyMessage, setApplyMessage] = useState("");

  const fetchTeam = async () => {
    try {
      const res = await fetch(`/api/teams/${teamId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTeam(data.team);
    } catch (err: any) {
      setError(err.message || "Failed to load team");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        if (data.authenticated) setSessionUser(data.user);
      } catch (e) {}
    };
    fetchSession();
    fetchTeam();
  }, [teamId]);

  const handleLeaveTeam = async () => {
    if (!confirm("Are you sure you want to leave this team?")) return;
    setIsLeaving(true);
    try {
      const res = await fetch("/api/teams/leave", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        window.location.href = "/teams";
      } else {
        alert(data.error || "Failed to leave team");
      }
    } catch {
      alert("Network error");
    } finally {
      setIsLeaving(false);
    }
  };

  const handleDisbandTeam = async () => {
    if (!confirm("Are you sure you want to DISBAND this team? This action is irreversible and all members will be removed.")) return;
    setIsDisbanding(true);
    try {
      const res = await fetch("/api/teams/disband", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId }),
      });
      const data = await res.json();
      if (res.ok) {
        window.location.href = "/teams";
      } else {
        alert(data.error || "Failed to disband team");
      }
    } catch {
      alert("Network error");
    } finally {
      setIsDisbanding(false);
    }
  };

  const handleInviteUser = async (user: { id: string | number; username: string; userTag?: string }) => {
    setInviteError("");
    setInviteSuccess("");
    setIsInviting(true);

    try {
      const res = await fetch("/api/teams/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUsername: user.username, targetTag: user.userTag || undefined }),
      });
      const data = await res.json();

      if (res.ok) {
        setInviteSuccess(`Invite sent to ${user.username}${user.userTag ? '#' + user.userTag : ''}!`);
      } else {
        setInviteError(data.error || "Failed to send invite");
      }
    } catch {
      setInviteError("Network error");
    } finally {
      setIsInviting(false);
    }
  };

  const handleSendInvite = async () => {
    if (!selectedUserToInvite) return;
    await handleInviteUser(selectedUserToInvite);
  };

  const handleApplyToJoin = async () => {
    setIsApplying(true);
    setApplyMessage("");
    try {
      const res = await fetch(`/api/teams/${teamId}/apply`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setApplyMessage("Application sent successfully!");
      } else {
        setApplyMessage(data.error || "Failed to send application");
      }
    } catch {
      setApplyMessage("Network error");
    } finally {
      setIsApplying(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white font-mono">Loading team...</div>;
  if (error || !team) return <div className="min-h-screen flex items-center justify-center text-red-500 font-mono text-xl">{error || "Team not found"}</div>;

  const isCaptain = sessionUser?.id === team.captainId;
  const isMember = team.members.some((m: any) => m.id === sessionUser?.id);

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <Link href="/teams" className="text-zerogreen hover:text-white font-mono mb-8 inline-block transition-colors">
          ← Back to Teams
        </Link>
        
        <Card className="bg-gradient-to-r from-zerogreen/10 via-transparent to-blue-500/10 border-2 border-zerogreen/30 mb-8">
          <CardBody className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className={`w-32 h-32 rounded flex items-center justify-center text-6xl font-bold overflow-hidden border-2 border-zerogreen ${team.avatarUrl ? "bg-transparent" : "bg-gradient-to-br from-zerogreen to-blue-500 text-black"}`}>
                {team.avatarUrl ? (
                  <img src={team.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  team.name[0]?.toUpperCase()
                )}
              </div>
              <div className="flex-grow text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2 justify-center md:justify-start">
                  <h1 className={`text-4xl font-bold text-white ${robotoMono.className}`}>
                    {team.name} <span className="text-gray-500 text-3xl ml-2">[{team.tag}]</span>
                  </h1>
                </div>
                {team.description && <p className="text-gray-400 font-mono max-w-2xl mb-4">{team.description}</p>}
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 font-mono">
                  <div className="bg-blue-900/40 border border-blue-700/50 text-blue-400 px-4 py-1.5 rounded-sm">
                    {team.totalPoints} Points
                  </div>
                  <div className="bg-purple-900/40 border border-purple-700/50 text-purple-400 px-4 py-1.5 rounded-sm">
                    {team.totalSolves} Solves
                  </div>
                  <div className="bg-gray-800/40 border border-gray-700/50 text-gray-400 px-4 py-1.5 rounded-sm">
                    Founded {new Date(team.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                {!isMember && !sessionUser && (
                  <Link
                    href="/signin"
                    className="border-2 border-zerogreen text-zerogreen font-mono hover:bg-zerogreen/10 px-4 py-2 rounded-lg text-center transition-colors"
                  >
                    Sign Up / Sign In to Join
                  </Link>
                )}
                {!isMember && sessionUser && (
                  <div className="flex flex-col gap-1 items-stretch md:items-end">
                    <Button
                      variant="bordered"
                      className="border-zerogreen text-zerogreen font-mono hover:bg-zerogreen/10 w-full"
                      onClick={handleApplyToJoin}
                      disabled={isApplying}
                    >
                      {isApplying ? "Applying..." : "Apply to Join"}
                    </Button>
                    {applyMessage && <span className="text-xs font-mono text-gray-400 text-right">{applyMessage}</span>}
                  </div>
                )}
                {isMember && !isCaptain && (
                  <Button
                    variant="bordered"
                    className="border-red-500 text-red-500 font-mono hover:bg-red-500/10"
                    onClick={handleLeaveTeam}
                    disabled={isLeaving}
                  >
                    {isLeaving ? "Leaving..." : "Leave Team"}
                  </Button>
                )}
                {isCaptain && (
                  <Button
                    variant="bordered"
                    className="border-red-700 text-red-600 font-mono hover:bg-red-700/10"
                    onClick={handleDisbandTeam}
                    disabled={isDisbanding}
                  >
                    {isDisbanding ? "Disbanding..." : "Disband Team"}
                  </Button>
                )}
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="mb-6 flex justify-between items-center">
          <h2 className={`text-2xl font-bold text-white ${orbitron.className}`}>
            <span className="text-zerogreen">◆</span> Members ({team.members.length})
          </h2>
          {isCaptain && (
            <div className="flex gap-2">
              <Button 
                as={Link}
                href={`/teams/${teamId}/edit`}
                variant="bordered"
                className="border-zerogreen text-zerogreen font-bold font-mono"
              >
                Edit Team
              </Button>
              <Button
                className="bg-zerogreen text-black font-bold font-mono"
                onClick={() => { setShowInviteModal(true); setInviteError(""); setInviteSuccess(""); setSelectedUserToInvite(null); }}
              >
                Invite Player
              </Button>
            </div>
          )}
        </div>

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="bg-[#0f0f0f] border-2 border-zerogreen/50 p-8 max-w-md w-full relative">
              <button
                onClick={() => setShowInviteModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white text-xl"
              >
                ✕
              </button>
              <h2 className={`text-2xl font-bold text-white mb-2 ${orbitron.className}`}>
                Invite Player
              </h2>
              <p className="text-gray-500 font-mono text-sm mb-6">
                Search for a user and select them to invite.
              </p>

              <UserSearch
                placeholder="Search player..."
                searchType="users"
                onSelect={(user) => {
                  setSelectedUserToInvite(user);
                  setInviteError("");
                  setInviteSuccess("");
                }}
              />

              {selectedUserToInvite && (
                <div className="mt-6 p-4 bg-gray-900 border border-gray-800 rounded flex items-center justify-between">
                  <div className="font-mono">
                    <span className="text-white font-bold">{selectedUserToInvite.username}</span>
                    {selectedUserToInvite.userTag && <span className="text-gray-500 ml-1">#{selectedUserToInvite.userTag}</span>}
                  </div>
                  <Button
                    onClick={handleSendInvite}
                    disabled={isInviting}
                    size="sm"
                    className="bg-zerogreen text-black font-bold font-mono"
                  >
                    {isInviting ? "Sending..." : "Send Invite"}
                  </Button>
                </div>
              )}

              {inviteError && <div className="text-red-500 font-mono text-sm mt-4">{inviteError}</div>}
              {inviteSuccess && <div className="text-zerogreen font-mono text-sm mt-4">{inviteSuccess}</div>}
            </div>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {team.members.map((member: any) => (
            <Link key={member.id} href={`/profile/${encodeURIComponent(member.username + (member.userTag ? '#' + member.userTag : ''))}`}>
              <Card className="bg-[#0f0f0f] border border-gray-800 hover:border-zerogreen/50 transition-colors">
                <CardBody className="p-4 flex flex-row items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl overflow-hidden border border-zerogreen/30 ${member.avatarUrl ? "bg-transparent" : "bg-gradient-to-br from-zerogreen/20 to-purple-500/20 text-white"}`}>
                    {member.avatarUrl ? (
                      <img src={member.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      member.username[0]?.toUpperCase()
                    )}
                  </div>
                  <div className="font-mono flex flex-col overflow-hidden">
                    <span className="text-white font-bold truncate flex items-center gap-2">
                      {member.username} 
                      {member.id === team.captainId && <span className="text-yellow-500 text-sm" title="Captain">👑</span>}
                    </span>
                    {member.userTag && <span className="text-gray-500 text-sm truncate">#{member.userTag}</span>}
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
