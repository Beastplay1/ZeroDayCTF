import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth/session";
import { mongoFindOne, mongoInsertOne } from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSessionFromCookies();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentUser = await mongoFindOne<any>("users", { id: session.userId });
    if (!currentUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (currentUser.teamId) {
      return NextResponse.json({ error: "You are already in a team" }, { status: 400 });
    }

    const team = await mongoFindOne<any>("teams", { _id: new ObjectId(id) as any });
    if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

    // Check if application already exists
    const existing = await mongoFindOne<any>("notifications", {
      userId: team.captainId,
      type: "team_join_request",
      senderId: session.userId,
      teamId: id,
      read: false
    });

    if (existing) {
      return NextResponse.json({ error: "Application already sent" }, { status: 400 });
    }

    await mongoInsertOne("notifications", {
      userId: team.captainId,
      type: "team_join_request",
      senderId: session.userId,
      senderUsername: session.username,
      senderTag: currentUser.userTag,
      teamId: id,
      teamName: team.name,
      message: `${session.username} has applied to join your team ${team.name}.`,
      createdAt: new Date().toISOString(),
      read: false,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/teams/[id]/apply POST]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
