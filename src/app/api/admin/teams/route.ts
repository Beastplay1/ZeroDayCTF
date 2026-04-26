import { NextResponse } from "next/server";
import { mongoFindMany } from "@/lib/db/mongodb";

export async function GET() {
  try {
    const teams = await mongoFindMany<any>(
      "teams",
      {},
      { createdAt: -1 }
    );

    const publicTeams = teams.map((t: any) => ({
      id: t._id.toString(),
      name: t.name,
      tag: t.tag,
      captainId: t.captainId,
      memberCount: t.members?.length || 0,
      totalPoints: t.totalPoints || 0,
      createdAt: t.createdAt,
    }));

    return NextResponse.json({ teams: publicTeams });
  } catch (err) {
    console.error("[admin/teams GET]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
