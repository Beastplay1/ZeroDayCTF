import { NextRequest, NextResponse } from "next/server";
import { mongoAggregate, mongoFindOne } from "@/lib/db/mongodb";
import { getSessionFromCookies } from "@/lib/auth/session";

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

    const pipeline: any[] = [
      { $match: matchStage },
      {
        $lookup: {
          from: "solves",
          localField: "id",
          foreignField: "userId",
          as: "userSolves",
        },
      },
      {
        $project: {
          _id: 0,
          id: 1,
          username: 1,
          userTag: 1,
          avatarUrl: 1,
          createdAt: 1,
          solveCount: { $size: "$userSolves" },
        },
      },
    ];

    const users = await mongoAggregate<any>("users", pipeline);
    const profile = users[0];

    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let friendStatus = "none";
    const session = await getSessionFromCookies();

    if (session) {
      // Check if friends
      const currentUser = await mongoFindOne<any>("users", { id: session.userId });
      if (currentUser?.friends?.includes(profile.id)) {
        friendStatus = "friends";
      } else {
        // Check if pending request from session user to target user
        const pendingRequest = await mongoFindOne<any>("notifications", {
          userId: profile.id,
          type: "friend_request",
          "data.senderId": session.userId
        });
        if (pendingRequest) {
          friendStatus = "pending";
        }
      }
    }

    return NextResponse.json({ profile, friendStatus });
  } catch (err) {
    console.error("[api/users/profile/[slug] GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
