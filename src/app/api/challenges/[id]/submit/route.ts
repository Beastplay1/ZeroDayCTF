import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth/session";
import { getChallengeById, recordSolve } from "@/lib/storage/challengeStore";
import { mongoFindOne, mongoInsertOne, mongoUpdateOne } from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";
import {
  parseGuestSessionToken,
  getGuestCookieName,
} from "@/lib/auth/guestSession";

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

  if (challenge.expiresAt && new Date() > new Date(challenge.expiresAt)) {
    return NextResponse.json({ result: "expired" }, { status: 200 });
  }

  // Daily challenges require authentication
  if (challenge.type === "daily" && !session) {
    return NextResponse.json(
      {
        result: "guest_restricted",
        error: "Not authenticated",
      },
      { status: 401 },
    );
  }

  // Constant-time comparison to prevent timing attacks
  if (!timingSafeEqual(flag, challenge.flag)) {
    return NextResponse.json({ result: "wrong" }, { status: 200 });
  }

  // Anonymous users on weekly challenges: record in guest_solves
  if (!session) {
    const guestCookie = req.cookies.get(getGuestCookieName())?.value;
    const guestSession = guestCookie
      ? await parseGuestSessionToken(guestCookie)
      : null;

    if (guestSession) {
      const existingGuestSolve = await mongoFindOne("guest_solves", {
        challengeId: id,
        guestId: guestSession.guestId,
      });

      if (!existingGuestSolve) {
        await mongoInsertOne("guest_solves", {
          guestId: guestSession.guestId,
          challengeId: id,
          solvedAt: new Date().toISOString(),
          createdAt: new Date(), // for TTL index
        });
      }
    }

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
  
  // Calculate bonus points based on solves BEFORE this submission
  let bonusPoints = 0;
  if (challenge.type === "weekly") {
    if (challenge.solves === 0) bonusPoints = 100;
  } else {
    if (challenge.solves === 0) bonusPoints = 500;
    else if (challenge.solves === 1) bonusPoints = 250;
    else if (challenge.solves === 2) bonusPoints = 50;
  }

  await Promise.all([
    mongoInsertOne("solves", {
      challengeId: id,
      userId: session.userId,
      username: session.username,
      solvedAt: new Date().toISOString(),
      bonusPoints,
    }),
    recordSolve(id, session.username, isFirstBlood),
  ]);

  // Handle Team Points
  const user = await mongoFindOne<any>("users", { id: session.userId });
  if (user && user.teamId) {
    const existingTeamSolve = await mongoFindOne("team_solves", {
      challengeId: id,
      teamId: user.teamId,
    });

    if (!existingTeamSolve) {
      await Promise.all([
        mongoInsertOne("team_solves", {
          challengeId: id,
          teamId: user.teamId,
          solvedAt: new Date().toISOString(),
        }),
        mongoUpdateOne(
          "teams",
          { _id: new ObjectId(user.teamId) as any },
          { $inc: { totalPoints: challenge.points + bonusPoints, totalSolves: 1 } } as any
        ),
      ]);
    }
  }

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
