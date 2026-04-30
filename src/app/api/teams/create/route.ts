import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth/session";
import { mongoFindOne, mongoInsertOne, mongoUpdateOne } from "@/lib/db/mongodb";

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, tag, description } = await req.json();

    if (!name || !tag) {
      return NextResponse.json({ error: "Name and tag are required" }, { status: 400 });
    }

    if (name.length > 32 || tag.length > 8) {
      return NextResponse.json({ error: "Name or tag too long" }, { status: 400 });
    }

    const currentUser = await mongoFindOne<any>("users", { id: session.userId });
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }


    if (currentUser.teamId) {
      return NextResponse.json({ error: "You are already in a team" }, { status: 400 });
    }

    // Check if team name or tag already exists
    const existingTeam = await mongoFindOne<any>("teams", {
      $or: [
        { name: { $regex: new RegExp(`^${name}$`, "i") } },
        { tag: { $regex: new RegExp(`^${tag}$`, "i") } }
      ]
    });

    if (existingTeam) {
      return NextResponse.json({ error: "Team name or tag already taken" }, { status: 400 });
    }

    // Create team
    const newTeam = {
      name,
      tag: tag.toUpperCase(),
      description: description || "",
      captainId: session.userId,
      members: [session.userId],
      createdAt: new Date().toISOString(),
      totalPoints: 0,
      totalSolves: 0
    };

    const result = await mongoInsertOne("teams", newTeam);
    const teamId = result.insertedId;

    // Update user to be in the team and increment teamsCreated
    await mongoUpdateOne("users", { id: session.userId }, { 
      $set: { teamId: teamId.toString() },
      $inc: { teamsCreated: 1 }
    } as any);

    return NextResponse.json({ success: true, teamId });
  } catch (err) {
    console.error("[api/teams/create POST]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
