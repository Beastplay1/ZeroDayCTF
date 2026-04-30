import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth/session";
import { mongoFindOne, mongoUpdateOne } from "@/lib/db/mongodb";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const team = await mongoFindOne<any>("teams", { _id: new ObjectId(id) as any });
    if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

    if (team.captainId !== session.userId) {
      return NextResponse.json({ error: "Only the captain can upload team avatar" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const validMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validMimeTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type." }, { status: 400 });
    }

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Max 2MB." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name) || ".png";
    const filename = `team_${id}_${crypto.randomBytes(8).toString("hex")}${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "team_avatars");

    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);

    const avatarUrl = `/api/images/team_avatars/${filename}`;

    await mongoUpdateOne("teams", { _id: new ObjectId(id) as any }, { $set: { avatarUrl } } as any);

    return NextResponse.json({ success: true, avatarUrl });
  } catch (err: any) {
    console.error("Team avatar upload error:", err);
    return NextResponse.json({ error: "Failed to upload avatar" }, { status: 500 });
  }
}
