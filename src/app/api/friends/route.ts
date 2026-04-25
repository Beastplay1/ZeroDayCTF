import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth/session";
import { mongoFindMany, mongoAggregate } from "@/lib/db/mongodb";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch friend requests directed to the current user
    const requests = await mongoFindMany<any>(
      "notifications",
      { userId: session.userId, type: "friend_request" },
      { createdAt: -1 }
    );

    // Fetch friends (from a 'friends' array on user object or separate collection)
    // We will assume friends is an array of IDs on the user object, or we use a 'friends' collection
    // Wait, we didn't implement 'friends' array. Let's get the user document to see if it has 'friends'
    const pipeline: any[] = [
      { $match: { id: session.userId } },
      {
        $lookup: {
          from: "users",
          localField: "friends", // assuming we will store friends as array of IDs
          foreignField: "id",
          as: "friendDocs"
        }
      },
      {
        $project: {
          _id: 0,
          friendDocs: {
            id: 1,
            username: 1,
            userTag: 1,
            avatarUrl: 1
          }
        }
      }
    ];

    const users = await mongoAggregate<any>("users", pipeline);
    const friends = users[0]?.friendDocs || [];

    return NextResponse.json({ requests, friends });
  } catch (err) {
    console.error("[api/friends GET]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
