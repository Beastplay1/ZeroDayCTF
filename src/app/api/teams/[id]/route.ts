import { NextRequest, NextResponse } from "next/server";
import { mongoFindOne, mongoAggregate, mongoUpdateOne } from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";
import { getSessionFromCookies } from "@/lib/auth/session";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch team with members details
    const pipeline: any[] = [
      { $match: { _id: new ObjectId(id) as any } },
      {
        $lookup: {
          from: "users",
          localField: "members",
          foreignField: "id",
          as: "memberDocs"
        }
      },
      {
        $project: {
          name: 1,
          tag: 1,
          description: 1,
          captainId: 1,
          createdAt: 1,
          avatarUrl: 1,
          totalPoints: 1,
          totalSolves: 1,
          memberDocs: {
            id: 1,
            username: 1,
            userTag: 1,
            avatarUrl: 1
          }
        }
      }
    ];

    const teams = await mongoAggregate<any>("teams", pipeline);
    const team = teams[0];

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Format for response
    const responseTeam = {
      id: team._id.toString(),
      name: team.name,
      tag: team.tag,
      description: team.description,
      captainId: team.captainId,
      createdAt: team.createdAt,
      avatarUrl: team.avatarUrl,
      totalPoints: team.totalPoints || 0,
      totalSolves: team.totalSolves || 0,
      members: team.memberDocs
    };

    return NextResponse.json({ team: responseTeam });
  } catch (err) {
    console.error("[api/teams/[id] GET]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSessionFromCookies();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, tag, description, avatarUrl } = await req.json();

    const team = await mongoFindOne<any>("teams", { _id: new ObjectId(id) as any });
    if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

    if (team.captainId !== session.userId) {
      return NextResponse.json({ error: "Only the captain can edit the team" }, { status: 403 });
    }

    if (name && name.length > 32) return NextResponse.json({ error: "Name too long" }, { status: 400 });
    if (tag && tag.length > 8) return NextResponse.json({ error: "Tag too long" }, { status: 400 });

    const updateData: any = {};
    if (name) updateData.name = name;
    if (tag) updateData.tag = tag.toUpperCase();
    if (description !== undefined) updateData.description = description;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

    await mongoUpdateOne("teams", { _id: new ObjectId(id) as any }, { $set: updateData } as any);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/teams/[id] PUT]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
