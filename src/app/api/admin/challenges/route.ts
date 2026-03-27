import { NextRequest, NextResponse } from "next/server";
import {
  getAllChallenges,
  createChallenge,
} from "@/lib/storage/challengeStore";
import type { ChallengeDoc } from "@/lib/storage/challengeStore";

// GET /api/admin/challenges — list all challenges (with flags, admin only)
export async function GET() {
  const challenges = await getAllChallenges();
  return NextResponse.json({ challenges });
}

// POST /api/admin/challenges — create a new challenge
export async function POST(req: NextRequest) {
  const body = await req.json();

  const required = [
    "name",
    "category",
    "difficulty",
    "points",
    "description",
    "flag",
    "type",
  ];
  for (const field of required) {
    if (!body[field]) {
      return NextResponse.json(
        { error: `Missing field: ${field}` },
        { status: 400 },
      );
    }
  }

  const validDifficulties = ["Easy", "Medium", "Hard", "Insane"];
  if (!validDifficulties.includes(body.difficulty)) {
    return NextResponse.json({ error: "Invalid difficulty" }, { status: 400 });
  }

  const validTypes = ["weekly", "daily"];
  if (!validTypes.includes(body.type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const data: Omit<ChallengeDoc, "_id" | "solves" | "createdAt"> = {
    name: String(body.name).trim(),
    category: String(body.category).trim(),
    difficulty: body.difficulty,
    points: Number(body.points),
    description: String(body.description).trim(),
    flag: String(body.flag).trim(),
    type: body.type,
    active: body.active ?? true,
    ...(body.file ? { file: String(body.file).trim() } : {}),
    ...(body.expiresAt ? { expiresAt: String(body.expiresAt) } : {}),
  };

  const insertedId = await createChallenge(data);
  return NextResponse.json({ insertedId }, { status: 201 });
}
