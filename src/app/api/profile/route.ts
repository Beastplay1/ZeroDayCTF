import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth/session";
import { mongoAggregate, mongoFindOne } from "@/lib/db/mongodb";

export async function GET() {
  const session = await getSessionFromCookies();

  if (!session) {
    return NextResponse.json({ authenticated: false });
  }

  // Get all solves for this user joined with challenge data
  const solves = await mongoAggregate<{
    challengeId: string;
    solvedAt: string;
    challenge: {
      name: string;
      category: string;
      difficulty: string;
      points: number;
      firstBlood?: string;
    };
  }>("solves", [
    { $match: { userId: session.userId } },
    { $addFields: { challengeObjectId: { $toObjectId: "$challengeId" } } },
    {
      $lookup: {
        from: "challenges",
        localField: "challengeObjectId",
        foreignField: "_id",
        as: "challenge",
      },
    },
    { $unwind: "$challenge" },
    {
      $project: {
        _id: 0,
        challengeId: 1,
        solvedAt: 1,
        "challenge.name": 1,
        "challenge.category": 1,
        "challenge.difficulty": 1,
        "challenge.points": 1,
        "challenge.firstBlood": 1,
      },
    },
    { $sort: { solvedAt: -1 } },
  ]);

  let totalPoints = 0;
  let firstBloods = 0;
  const categoryBreakdown: Record<string, number> = {};

  const solvedChallenges = solves.map((s) => {
    const pts = s.challenge.points || 0;
    totalPoints += pts;

    const isFB = s.challenge.firstBlood === session.username;
    if (isFB) firstBloods++;

    const cat = s.challenge.category || "Other";
    categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;

    return {
      challengeId: s.challengeId,
      name: s.challenge.name,
      category: cat,
      difficulty: s.challenge.difficulty,
      points: pts,
      solvedAt: s.solvedAt,
      wasFirstBlood: isFB,
    };
  });

  // Compute rank: position of this user sorted by total points (only existing users)
  const rankList = await mongoAggregate<{ _id: number; totalPoints: number }>(
    "solves",
    [
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "id",
          as: "user",
        },
      },
      { $match: { "user.0": { $exists: true } } },
      { $addFields: { challengeObjectId: { $toObjectId: "$challengeId" } } },
      {
        $lookup: {
          from: "challenges",
          localField: "challengeObjectId",
          foreignField: "_id",
          as: "challenge",
        },
      },
      { $unwind: "$challenge" },
      {
        $group: {
          _id: "$userId",
          totalPoints: { $sum: "$challenge.points" },
        },
      },
      { $sort: { totalPoints: -1 } },
    ],
  );

  const rankIndex = rankList.findIndex((r) => r._id === session.userId);
  const rank = rankIndex >= 0 ? rankIndex + 1 : null;

  const userDoc = await mongoFindOne<{ createdAt?: string }>("users", {
    id: session.userId,
  });

  return NextResponse.json({
    authenticated: true,
    username: session.username,
    totalPoints,
    totalSolves: solvedChallenges.length,
    firstBloods,
    rank,
    solvedChallenges,
    categoryBreakdown,
    joinedDate: userDoc?.createdAt ?? null,
  });
}
