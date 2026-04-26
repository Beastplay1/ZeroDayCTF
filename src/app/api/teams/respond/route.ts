import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth/session";
import { mongoFindOne, mongoUpdateOne, mongoDeleteOne } from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromCookies();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { notificationId, action } = await req.json();
    if (!notificationId || !["accept", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const notification = await mongoFindOne<any>("notifications", {
      _id: new ObjectId(notificationId) as any,
      userId: session.userId,
      type: { $in: ["team_invite", "team_join_request"] }
    });

    if (!notification) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    if (action === "accept") {
      const isJoinReq = notification.type === "team_join_request";
      const targetUserId = isJoinReq ? notification.senderId : session.userId;
      const teamId = isJoinReq ? notification.teamId : notification.data.teamId;

      const targetUser = await mongoFindOne<any>("users", { id: targetUserId });
      if (targetUser?.teamId) {
        // Delete notification anyway since they can't join
        await mongoDeleteOne("notifications", { _id: notification._id });
        return NextResponse.json({ error: isJoinReq ? "User is already in a team" : "You are already in a team" }, { status: 400 });
      }

      const team = await mongoFindOne<any>("teams", { _id: new ObjectId(teamId) as any });
      
      if (!team) {
        await mongoDeleteOne("notifications", { _id: notification._id });
        return NextResponse.json({ error: "Team no longer exists" }, { status: 404 });
      }

      if (isJoinReq && team.captainId !== session.userId) {
        return NextResponse.json({ error: "Only the captain can accept join requests" }, { status: 403 });
      }

      // Add to team members
      await mongoUpdateOne(
        "teams",
        { _id: team._id },
        { $addToSet: { members: targetUserId } } as any
      );

      // Update user teamId
      await mongoUpdateOne(
        "users",
        { id: targetUserId },
        { $set: { teamId: teamId } } as any
      );
    }

    // Always delete the notification
    await mongoDeleteOne("notifications", { _id: notification._id });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/teams/respond POST]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
