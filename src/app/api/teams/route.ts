import { NextResponse } from "next/server";
import { mongoFindMany } from "@/lib/db/mongodb";

export async function GET() {
  try {
    const teams = await mongoFindMany<any>(
      "teams",
      {},
      { totalPoints: -1 }, // Sort by points descending
      100 // limit to top 100 for now
    );

    // Map to public team info
    const publicTeams = teams.map((t: any) => ({
      id: t._id.toString(),
      name: t.name,
      tag: t.tag,
      description: t.description,
      memberCount: t.members?.length || 0,
      totalPoints: t.totalPoints || 0,
      totalSolves: t.totalSolves || 0,
      avatarUrl: t.avatarUrl
    }));

    return NextResponse.json({ teams: publicTeams });
  } catch (err) {
    console.error("[api/teams GET]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
