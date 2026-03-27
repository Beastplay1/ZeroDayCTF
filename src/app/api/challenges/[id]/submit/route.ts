import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth/session";
import { getChallengeById, recordSolve } from "@/lib/storage/challengeStore";
import { mongoFindOne, mongoInsertOne } from "@/lib/db/mongodb";

interface SolveRecord {
  challengeId: string;
  userId: number;
  username: string;
  solvedAt: string;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSessionFromCookies();

  const { id } = await params;
  const body = await req.json();
  const flag: string = (body.flag ?? "").trim();

  if (!flag) {
    return NextResponse.json({ error: "No flag provided" }, { status: 400 });
  }

  const challenge = await getChallengeById(id);
  if (!challenge || !challenge.active) {
    return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
  }

  // Daily challenges require authentication
  if (challenge.type === "daily" && !session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Constant-time comparison to prevent timing attacks
  if (!timingSafeEqual(flag, challenge.flag)) {
    return NextResponse.json({ result: "wrong" }, { status: 200 });
  }

  // Anonymous users on weekly challenges: just confirm correct, no recording
  if (!session) {
    return NextResponse.json(
      { result: "correct", anonymous: true },
      { status: 200 },
    );
  }

  // Check if user already solved this challenge
  const existing = await mongoFindOne<SolveRecord>("solves", {
    challengeId: id,
    userId: session.userId,
  });
  if (existing) {
    return NextResponse.json({ result: "already_solved" }, { status: 200 });
  }

  // Record the solve
  const isFirstBlood = challenge.solves === 0;
  await Promise.all([
    mongoInsertOne<SolveRecord>("solves", {
      challengeId: id,
      userId: session.userId,
      username: session.username,
      solvedAt: new Date().toISOString(),
    }),
    recordSolve(id, session.username, isFirstBlood),
  ]);

  return NextResponse.json({
    result: "correct",
    firstBlood: isFirstBlood,
    points: challenge.points,
  });
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
