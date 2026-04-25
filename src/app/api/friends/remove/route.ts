import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth/session";
import { mongoFindOne, mongoUpdateOne } from "@/lib/db/mongodb";

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { targetSlug } = await req.json();

    if (!targetSlug) {
      return NextResponse.json({ error: "Invalid target user" }, { status: 400 });
    }

    const parts = targetSlug.split("#");
    const targetUsername = parts[0];
    const targetTag = parts[1];

    const matchStage: any = { username: targetUsername };
    if (targetTag) {
      matchStage.userTag = targetTag;
    }

    // Find target user
    const targetUser = await mongoFindOne<any>("users", matchStage);
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Remove from current user's friends array
    await mongoUpdateOne(
      "users",
      { id: session.userId },
      { $pull: { friends: targetUser.id } } as any
    );

    // Remove from target user's friends array
    await mongoUpdateOne(
      "users",
      { id: targetUser.id },
      { $pull: { friends: session.userId } } as any
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/friends/remove POST]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
