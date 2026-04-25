import { useState, useEffect } from "react";
import { Button, Card, CardBody } from "@heroui/react";
import Link from "next/link";
import { Orbitron } from "next/font/google";

const orbitron = Orbitron({ subsets: ["latin"] });

interface FriendRequest {
  _id: string; // notification ID
  userId: number;
  data: {
    senderId: number;
    senderUsername: string;
    senderTag?: string;
  };
  createdAt: string;
}

interface Friend {
  id: number;
  username: string;
  userTag?: string;
  avatarUrl?: string;
}

export function FriendsTab() {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFriendsData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/friends");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setRequests(data.requests || []);
      setFriends(data.friends || []);
    } catch (err) {
      setError("Failed to load friends data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriendsData();
  }, []);

  const handleRequest = async (notificationId: string, action: "accept" | "reject") => {
    try {
      const res = await fetch("/api/friends/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId, action }),
      });
      if (res.ok) {
        fetchFriendsData(); // reload
      } else {
        alert("Action failed");
      }
    } catch {
      alert("Network error");
    }
  };

  if (loading) return <div className="text-gray-400 font-mono">Loading friends...</div>;
  if (error) return <div className="text-red-400 font-mono">{error}</div>;

  return (
    <div className="space-y-8">
      {/* Pending Requests */}
      <div>
        <h2 className={`text-2xl font-bold text-white mb-4 ${orbitron.className}`}>
          <span className="text-zerogreen">◆</span> Friend Requests
        </h2>
        {requests.length === 0 ? (
          <p className="text-gray-500 font-mono italic">No pending requests.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {requests.map((req) => (
              <Card key={req._id} className="bg-[#0f0f0f] border border-yellow-500/30">
                <CardBody className="p-4 flex flex-row items-center justify-between">
                  <div className="font-mono">
                    <span className="text-white font-bold">{req.data.senderUsername}</span>
                    {req.data.senderTag && <span className="text-gray-500">#{req.data.senderTag}</span>}
                    <div className="text-xs text-gray-500 mt-1">wants to be your friend</div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-zerogreen text-black font-bold font-mono"
                      onClick={() => handleRequest(req._id, "accept")}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="bordered"
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10 font-mono"
                      onClick={() => handleRequest(req._id, "reject")}
                    >
                      Reject
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Friends List */}
      <div>
        <h2 className={`text-2xl font-bold text-white mb-4 ${orbitron.className}`}>
          <span className="text-zerogreen">◆</span> My Friends
        </h2>
        {friends.length === 0 ? (
          <p className="text-gray-500 font-mono italic">You don't have any friends yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {friends.map((friend) => (
              <Link key={friend.id} href={`/profile/${encodeURIComponent(friend.username + (friend.userTag ? '#' + friend.userTag : ''))}`}>
                <Card className="bg-[#0f0f0f] border border-gray-800 hover:border-zerogreen/50 transition-colors cursor-pointer">
                  <CardBody className="p-4 flex flex-row items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex flex-shrink-0 items-center justify-center font-bold text-xl overflow-hidden border border-zerogreen/30 ${friend.avatarUrl ? "bg-transparent" : "bg-gradient-to-br from-zerogreen/20 to-purple-500/20 text-white"}`}>
                      {friend.avatarUrl ? (
                        <img src={friend.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        friend.username[0]?.toUpperCase()
                      )}
                    </div>
                    <div className="font-mono flex flex-col overflow-hidden">
                      <span className="text-white font-bold truncate">{friend.username}</span>
                      {friend.userTag && <span className="text-gray-500 text-sm truncate">#{friend.userTag}</span>}
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
