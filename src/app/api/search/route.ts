import { NextRequest, NextResponse } from "next/server";
import { mongoAggregate } from "@/lib/db/mongodb";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";

    if (q.trim().length < 2) {
      return NextResponse.json({ results: [] });
    }

    const parts = q.trim().split("#");
    const namePart = parts[0];
    const tagPart = parts[1];

    const userMatchStage: any = {};
    const teamMatchStage: any = {};

    if (namePart) {
      userMatchStage.username = { $regex: namePart, $options: "i" };
      teamMatchStage.name = { $regex: namePart, $options: "i" };
    }

    if (tagPart) {
      userMatchStage.userTag = tagPart;
      teamMatchStage.tag = tagPart.toUpperCase();
    }

    const userPipeline: any[] = [
      { $match: userMatchStage },
      { $limit: 5 },
      {
        $project: {
          _id: 0,
          id: { $toString: "$id" },
          type: "user",
          name: "$username",
          tag: "$userTag",
          avatarUrl: 1,
        },
      },
    ];

    const teamPipeline: any[] = [
      { $match: teamMatchStage },
      { $limit: 5 },
      {
        $project: {
          id: { $toString: "$_id" },
          type: "team",
          name: 1,
          tag: 1,
          avatarUrl: 1,
        },
      },
    ];

    const [users, teams] = await Promise.all([
      mongoAggregate<any>("users", userPipeline),
      mongoAggregate<any>("teams", teamPipeline),
    ]);

    // Force type literal
    const formattedUsers = users.map(u => ({ ...u, type: "user" }));
    const formattedTeams = teams.map(t => ({ ...t, type: "team" }));

    const results = [...formattedUsers, ...formattedTeams];

    return NextResponse.json({ results });
  } catch (err) {
    console.error("[api/search GET]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
