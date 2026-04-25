"use client";

import { useEffect, useState, use } from "react";
import { Orbitron, Roboto_Mono } from "next/font/google";
import { Card, CardBody, Button } from "@heroui/react";

const orbitron = Orbitron({ subsets: ["latin"] });
const robotoMono = Roboto_Mono({ subsets: ["latin"] });

interface PublicProfileData {
  id: number;
  username: string;
  userTag?: string;
  avatarUrl?: string;
  createdAt: string;
  solveCount: number;
}

export default function PublicProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const unwrappedParams = use(params);
  const slug = decodeURIComponent(unwrappedParams.slug);
  
  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [friendStatus, setFriendStatus] = useState<"none" | "pending" | "friends">("none");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
  }, [slug]);

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

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
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
                      {!isLoggedIn ? "Login to Add Friend" : "Add Friend"}
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                  <div className="bg-blue-900/40 border border-blue-700/50 text-blue-400 px-4 py-1.5 rounded-full text-sm font-mono flex items-center gap-2">
                    {profile.solveCount} Solves
                  </div>
                  <div className="bg-purple-900/40 border border-purple-700/50 text-purple-400 px-4 py-1.5 rounded-full text-sm font-mono flex items-center gap-2">
                    Registered: {new Date(profile.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
