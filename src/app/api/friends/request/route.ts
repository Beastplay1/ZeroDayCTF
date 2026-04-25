import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth/session";
import { mongoFindOne, mongoInsertOne } from "@/lib/db/mongodb";

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { targetSlug } = await req.json();

    if (!targetSlug) {
      return NextResponse.json({ error: "Invalid target user" }, { status: 400 });
    }

    const parts = targetSlug.split("#");
    const targetUsername = parts[0];
    const targetTag = parts[1];

    if (targetUsername === session.username && targetTag === undefined) {
      return NextResponse.json({ error: "Cannot add yourself" }, { status: 400 });
    }

    const matchStage: any = { username: targetUsername };
    if (targetTag) {
      matchStage.userTag = targetTag;
    }

    // Find target user
    const targetUser = await mongoFindOne<any>("users", matchStage);
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if request already sent
    const existingReq = await mongoFindOne<any>("notifications", {
      userId: targetUser.id,
      type: "friend_request",
      "data.senderId": session.userId,
    });

    if (existingReq) {
      return NextResponse.json({ error: "Friend request already sent" }, { status: 400 });
    }

    // Check if they are already friends
    const currentUser = await mongoFindOne<any>("users", { id: session.userId });
    if (currentUser?.friends?.includes(targetUser.id)) {
      return NextResponse.json({ error: "Already friends" }, { status: 400 });
    }

    await mongoInsertOne("notifications", {
      userId: targetUser.id,
      type: "friend_request",
      title: "New Friend Request",
      message: `${session.username} wants to be your friend!`,
      isRead: false,
      createdAt: new Date().toISOString(),
      data: {
        senderId: session.userId,
        senderUsername: session.username,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/friends/request POST]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
