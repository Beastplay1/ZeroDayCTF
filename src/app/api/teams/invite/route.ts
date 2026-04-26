import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth/session";
import { mongoFindOne, mongoInsertOne } from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromCookies();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { targetUsername, targetTag } = await req.json();
    if (!targetUsername) return NextResponse.json({ error: "Target user required" }, { status: 400 });

    const currentUser = await mongoFindOne<any>("users", { id: session.userId });
    if (!currentUser || !currentUser.teamId) {
      return NextResponse.json({ error: "You are not in a team" }, { status: 400 });
    }

    const team = await mongoFindOne<any>("teams", { _id: new ObjectId(currentUser.teamId) as any });
    if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

    if (team.captainId !== session.userId) {
      return NextResponse.json({ error: "Only the captain can invite" }, { status: 403 });
    }

    // Find target user
    const matchStage: any = { username: targetUsername };
    if (targetTag) matchStage.userTag = targetTag;
    
    const targetUser = await mongoFindOne<any>("users", matchStage);
    if (!targetUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (targetUser.teamId) {
      return NextResponse.json({ error: "User is already in a team" }, { status: 400 });
    }

    // Check if invite already sent
    const existingReq = await mongoFindOne<any>("notifications", {
      userId: targetUser.id,
      type: "team_invite",
      "data.teamId": team._id.toString()
    });

    if (existingReq) {
      return NextResponse.json({ error: "Invite already sent" }, { status: 400 });
    }

    // Insert notification
    await mongoInsertOne("notifications", {
      userId: targetUser.id,
      type: "team_invite",
      title: "Team Invite",
      message: `You have been invited to join ${team.name} [${team.tag}]!`,
      isRead: false,
      createdAt: new Date().toISOString(),
      data: {
        teamId: team._id.toString(),
        teamName: team.name,
        teamTag: team.tag,
        senderId: session.userId,
        senderUsername: session.username
      }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/teams/invite POST]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
