import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth/session";
import { mongoFindOne, mongoUpdateMany, mongoDeleteOne } from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromCookies();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { teamId } = await req.json();
    if (!teamId) return NextResponse.json({ error: "Team ID required" }, { status: 400 });

    const team = await mongoFindOne<any>("teams", { _id: new ObjectId(teamId) as any });
    if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

    if (team.captainId !== session.userId) {
      return NextResponse.json({ error: "Only the captain can disband the team" }, { status: 403 });
    }

    // Remove teamId from all members
    await mongoUpdateMany(
      "users",
      { teamId: teamId },
      { $unset: { teamId: "" } } as any
    );

    // Decrement teamsCreated for the captain so they can create a new team
    await mongoUpdateMany(
      "users",
      { id: team.captainId },
      { $inc: { teamsCreated: -1 } } as any
    );

    // Delete the team
    await mongoDeleteOne("teams", { _id: new ObjectId(teamId) as any });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/teams/disband POST]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
