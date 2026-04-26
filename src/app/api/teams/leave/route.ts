import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth/session";
import { mongoFindOne, mongoUpdateOne } from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromCookies();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentUser = await mongoFindOne<any>("users", { id: session.userId });
    if (!currentUser || !currentUser.teamId) {
      return NextResponse.json({ error: "Not in a team" }, { status: 400 });
    }

    const team = await mongoFindOne<any>("teams", { _id: new ObjectId(currentUser.teamId) as any });
    if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

    if (team.captainId === session.userId) {
      return NextResponse.json({ error: "Captain cannot leave. Transfer ownership or disband the team." }, { status: 400 });
    }

    // Remove user from team members
    await mongoUpdateOne(
      "teams",
      { _id: team._id },
      { $pull: { members: session.userId } } as any
    );

    // Remove teamId from user
    await mongoUpdateOne(
      "users",
      { id: session.userId },
      { $unset: { teamId: "" } } as any
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/teams/leave POST]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
