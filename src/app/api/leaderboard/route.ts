import { NextRequest, NextResponse } from "next/server";
import { mongoAggregate, mongoFindMany } from "@/lib/db/mongodb";
import { formatUsernameNumber } from "@/lib/storage/userStore";

interface SolveWithChallenge {
  _id: { userId: number; username: string; usernum?: number };
  points: number;
  solves: number;
}

interface ChallengeFirstBlood {
  firstBlood: string;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const timeframe = searchParams.get("timeframe") ?? "all-time";

    const now = new Date();
    let dateFilter: Record<string, unknown> = {};
    if (timeframe === "weekly") {
      const since = new Date(now);
      since.setDate(since.getDate() - 7);
      dateFilter = { solvedAt: { $gte: since.toISOString() } };
    } else if (timeframe === "monthly") {
      const since = new Date(now);
      since.setDate(since.getDate() - 30);
      dateFilter = { solvedAt: { $gte: since.toISOString() } };
    }

    // Aggregate solves → join challenges → filter deleted users → sum points, count solves
    const pipeline: Record<string, unknown>[] = [
      ...(Object.keys(dateFilter).length ? [{ $match: dateFilter }] : []),
      // Filter out solves from users that no longer exist
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "id",
          as: "user",
        },
      },
      { $match: { "user.0": { $exists: true } } },
      {
        $addFields: {
          challengeObjectId: { $toObjectId: "$challengeId" },
        },
      },
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
          _id: {
            userId: "$userId",
            username: { $arrayElemAt: ["$user.username", 0] },
            usernum: { $arrayElemAt: ["$user.usernum", 0] },
          },
          points: { $sum: "$challenge.points" },
          solves: { $sum: 1 },
        },
      },
      { $sort: { points: -1 } },
      { $limit: 100 },
    ];

    const results = await mongoAggregate<SolveWithChallenge>(
      "solves",
      pipeline,
    );

    // Count first bloods per user
    const challenges = await mongoFindMany<ChallengeFirstBlood>("challenges", {
      firstBlood: { $exists: true, $ne: null },
    });
    const firstBloodMap: Record<string, number> = {};
    for (const c of challenges) {
      if (c.firstBlood) {
        firstBloodMap[c.firstBlood] = (firstBloodMap[c.firstBlood] ?? 0) + 1;
      }
    }

    const leaderboard = results.map((entry, i) => {
      const displayUsername =
        typeof entry._id.usernum === "number"
          ? formatUsernameNumber(entry._id.username, entry._id.usernum)
          : entry._id.username;

      return {
        rank: i + 1,
        username: displayUsername,
        points: entry.points,
        solves: entry.solves,
        firstBloods:
          firstBloodMap[displayUsername] ?? firstBloodMap[entry._id.username] ?? 0,
      };
    });

    return NextResponse.json({ leaderboard });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 },
    );
  }
}
