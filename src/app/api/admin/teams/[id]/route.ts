import { NextRequest, NextResponse } from "next/server";
import { mongoDeleteOne, mongoUpdateMany, mongoUpdateOne } from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Remove teamId from all members
    await mongoUpdateMany(
      "users",
      { teamId: id },
      { $unset: { teamId: "" } } as any
    );

    // Delete the team
    await mongoDeleteOne("teams", { _id: new ObjectId(id) as any });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/teams DELETE]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, tag, description, totalPoints } = await req.json();

    const updateData: any = {};
    if (name) updateData.name = name;
    if (tag) updateData.tag = tag.toUpperCase();
    if (description !== undefined) updateData.description = description;
    if (totalPoints !== undefined) updateData.totalPoints = Number(totalPoints);

    await mongoUpdateOne(
      "teams",
      { _id: new ObjectId(id) as any },
      { $set: updateData } as any
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/teams PUT]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
