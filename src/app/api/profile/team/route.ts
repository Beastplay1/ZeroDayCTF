import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth/session";
import { mongoFindOne } from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return NextResponse.json({ team: null });
    }

    const user = await mongoFindOne<any>("users", { id: session.userId });
    if (!user || !user.teamId) {
      return NextResponse.json({ team: null });
    }

    const teamDoc = await mongoFindOne<any>("teams", { _id: new ObjectId(user.teamId) as any });
    if (!teamDoc) {
      return NextResponse.json({ team: null });
    }

    return NextResponse.json({
      team: {
        id: teamDoc._id.toString(),
        name: teamDoc.name,
        tag: teamDoc.tag,
        avatarUrl: teamDoc.avatarUrl,
      },
    });
  } catch (err) {
    console.error("[api/profile/team GET]", err);
    return NextResponse.json({ team: null });
  }
}
