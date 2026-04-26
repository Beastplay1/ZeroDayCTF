import { NextRequest, NextResponse } from "next/server";
import { mongoAggregate, mongoFindMany } from "@/lib/db/mongodb";
import { formatUserDisplayHandle } from "@/lib/storage/userStore";

interface SolveWithChallenge {
  _id: {
    userId: number;
    username: string;
    userTag?: string;
  };
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
    const type = searchParams.get("type") ?? "users";

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

    if (type === "teams") {
      // Team Leaderboard
      if (timeframe === "all-time") {
        // Fast path for all-time teams
        const teams = await mongoAggregate<any>("teams", [
          { $match: { totalPoints: { $gt: 0 } } },
          { $sort: { totalPoints: -1, totalSolves: -1 } },
          { $limit: 100 }
        ]);
        
        const leaderboard = teams.map((t, i) => ({
          id: t._id.toString(),
          rank: i + 1,
          username: t.name,
          tag: t.tag,
          points: t.totalPoints || 0,
          solves: t.totalSolves || 0,
          firstBloods: 0 // Not tracked at team level easily right now
        }));
        return NextResponse.json({ leaderboard });
      } else {
        // Timeframe team leaderboard using team_solves
        const pipeline: Record<string, unknown>[] = [
          ...(Object.keys(dateFilter).length ? [{ $match: dateFilter }] : []),
          {
            $addFields: {
              challengeObjectId: { $toObjectId: "$challengeId" },
              teamObjectId: { $toObjectId: "$teamId" }
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
            $lookup: {
              from: "teams",
              localField: "teamObjectId",
              foreignField: "_id",
              as: "team",
            },
          },
          { $unwind: "$team" },
          {
            $group: {
              _id: {
                teamId: "$teamId",
                name: "$team.name",
                tag: "$team.tag",
              },
              points: {
                $sum: "$challenge.points" // We don't have bonusPoints in team_solves, so this is slightly inaccurate for timeframes, but acceptable for now
              },
              solves: { $sum: 1 },
            },
          },
          { $sort: { points: -1, solves: -1 } },
          { $limit: 100 },
        ];

        const results = await mongoAggregate<any>("team_solves", pipeline);
        const leaderboard = results.map((entry, i) => ({
          id: entry._id.teamId,
          rank: i + 1,
          username: entry._id.name,
          tag: entry._id.tag,
          points: entry.points,
          solves: entry.solves,
          firstBloods: 0
        }));
        return NextResponse.json({ leaderboard });
      }
    }

    // User Leaderboard
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
            userTag: { $arrayElemAt: ["$user.userTag", 0] },
          },
          points: {
            $sum: {
              $add: ["$challenge.points", { $ifNull: ["$bonusPoints", 0] }],
            },
          },
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
      const displayUsername = formatUserDisplayHandle({
        username: entry._id.username,
        userTag: entry._id.userTag,
      });

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
