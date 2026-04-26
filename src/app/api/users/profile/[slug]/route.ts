import { NextRequest, NextResponse } from "next/server";
import { mongoAggregate, mongoFindOne, mongoFindMany } from "@/lib/db/mongodb";
import { getSessionFromCookies } from "@/lib/auth/session";
import { formatUserDisplayHandle } from "@/lib/storage/userStore";
import { ObjectId } from "mongodb";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);

    const parts = decodedSlug.split("#");
    const targetUsername = parts[0];
    const targetTag = parts[1];

    const matchStage: any = { username: targetUsername };
    if (targetTag) {
      matchStage.userTag = targetTag;
    }

    const users = await mongoAggregate<any>("users", [
      { $match: matchStage },
      {
        $project: {
          _id: 0,
          id: 1,
          username: 1,
          userTag: 1,
          avatarUrl: 1,
          createdAt: 1,
          teamId: 1,
        },
      },
    ]);
    const userDoc = users[0];

    if (!userDoc) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if viewing own profile
    const session = await getSessionFromCookies();
    if (session && session.userId === userDoc.id) {
      return NextResponse.json({ isOwnProfile: true });
    }

    // Get solves with challenge data
    const solves = await mongoAggregate<any>("solves", [
      { $match: { userId: userDoc.id } },
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
          bonusPoints: 1,
          "challenge.name": 1,
          "challenge.category": 1,
          "challenge.difficulty": 1,
          "challenge.points": 1,
          "challenge.firstBlood": 1,
        },
      },
      { $sort: { solvedAt: -1 } },
    ]);

    const displayHandle = formatUserDisplayHandle({
      username: userDoc.username,
      userTag: userDoc.userTag,
    });

    let totalPoints = 0;
    let firstBloods = 0;
    const categoryBreakdown: Record<string, number> = {};

    const solvedChallenges = solves.map((s: any) => {
      const pts = (s.challenge.points || 0) + (s.bonusPoints || 0);
      totalPoints += pts;

      const isFB = s.challenge.firstBlood === userDoc.username || s.challenge.firstBlood === displayHandle;
      if (isFB) firstBloods++;

      const cat = s.challenge.category || "Other";
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;

      return {
        challengeId: s.challengeId,
        name: s.challenge.name,
        category: cat,
        difficulty: s.challenge.difficulty,
        points: s.challenge.points || 0,
        solvedAt: s.solvedAt,
        wasFirstBlood: isFB,
      };
    });

    // Compute rank
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
            totalPoints: {
              $sum: {
                $add: ["$challenge.points", { $ifNull: ["$bonusPoints", 0] }],
              },
            },
          },
        },
        { $sort: { totalPoints: -1 } },
      ]
    );

    const rankIndex = rankList.findIndex((r) => r._id === userDoc.id);
    const rank = rankIndex >= 0 ? rankIndex + 1 : null;

    // Get team info
    let team = null;
    if (userDoc.teamId) {
      try {
        const teamDoc = await mongoFindOne<any>("teams", { _id: new ObjectId(userDoc.teamId) as any });
        if (teamDoc) {
          team = {
            id: teamDoc._id.toString(),
            name: teamDoc.name,
            tag: teamDoc.tag,
            avatarUrl: teamDoc.avatarUrl,
          };
        }
      } catch {}
    }

    // Friend status
    let friendStatus = "none";
    if (session) {
      const currentUser = await mongoFindOne<any>("users", { id: session.userId });
      if (currentUser?.friends?.includes(userDoc.id)) {
        friendStatus = "friends";
      } else {
        const pendingRequest = await mongoFindOne<any>("notifications", {
          userId: userDoc.id,
          type: "friend_request",
          "data.senderId": session.userId,
        });
        if (pendingRequest) {
          friendStatus = "pending";
        }
      }
    }

    const profile = {
      id: userDoc.id,
      username: userDoc.username,
      userTag: userDoc.userTag,
      avatarUrl: userDoc.avatarUrl,
      createdAt: userDoc.createdAt,
      solveCount: solvedChallenges.length,
      totalPoints,
      firstBloods,
      rank,
      solvedChallenges,
      categoryBreakdown,
      team,
    };

    return NextResponse.json({ profile, friendStatus });
  } catch (err) {
    console.error("[api/users/profile/[slug] GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
