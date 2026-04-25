import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth/session";
import { mongoFindOne, mongoUpdateOne, mongoDeleteOne } from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { notificationId, action } = await req.json();

    if (!notificationId || !["accept", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Find the notification
    const notification = await mongoFindOne<any>("notifications", {
      _id: new ObjectId(notificationId) as any,
      userId: session.userId,
      type: "friend_request"
    });

    if (!notification) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (action === "accept") {
      const senderId = notification.data?.senderId;
      if (!senderId) {
        return NextResponse.json({ error: "Invalid sender" }, { status: 400 });
      }

      // Add to current user's friends array
      await mongoUpdateOne(
        "users",
        { id: session.userId },
        { $addToSet: { friends: senderId } } as any
      );

      // Add to sender's friends array
      await mongoUpdateOne(
        "users",
        { id: senderId },
        { $addToSet: { friends: session.userId } } as any
      );
    }

    // Delete the notification
    await mongoDeleteOne("notifications", {
      _id: new ObjectId(notificationId) as any
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/friends/respond POST]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
