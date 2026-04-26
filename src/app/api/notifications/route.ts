import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth/session";
import { mongoFindMany, mongoUpdateMany } from "@/lib/db/mongodb";

export interface NotificationDoc {
  _id?: any; // ObjectId
  userId: number; // The user receiving the notification
  type: "friend_request" | "event" | "system" | "team_invite" | "team_join_request";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: any; // Additional data, like sender ID or team ID
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifications = await mongoFindMany<NotificationDoc>(
      "notifications",
      { userId: session.userId },
      { createdAt: -1 },
      50
    );

    return NextResponse.json({ notifications });
  } catch (err) {
    console.error("[api/notifications GET]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// Mark all as read
export async function PUT(req: NextRequest) {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await mongoUpdateMany(
      "notifications",
      { userId: session.userId, isRead: false },
      { $set: { isRead: true } }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/notifications PUT]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
