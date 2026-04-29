import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth/session";
import { getChallengeById } from "@/lib/storage/challengeStore";
import { unlockHint, isHintUnlocked } from "@/lib/storage/hintStore";
import { mongoAggregate } from "@/lib/db/mongodb";
import { UnlockedHint } from "@/lib/storage/hintStore";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSessionFromCookies();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { hintIndex } = await req.json();

  const challenge = await getChallengeById(id);
  if (!challenge) {
    return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
  }

  if (!challenge.hints || !challenge.hints[hintIndex]) {
    return NextResponse.json({ error: "Hint not found" }, { status: 404 });
  }

  const alreadyUnlocked = await isHintUnlocked(session.userId, id, hintIndex);
  if (alreadyUnlocked) {
    return NextResponse.json({ success: true, message: "Already unlocked" });
  }

  const hintCost = challenge.hints[hintIndex].cost;

  // Calculate current total points
  const solveData = await mongoAggregate<any>("solves", [
    { $match: { userId: session.userId } },
    { $addFields: { challengeObjectId: { $toObjectId: "$challengeId" } } },
    {
      $lookup: {
        from: "challenges",
        localField: "challengeObjectId",
        foreignField: "_id",
        as: "challenge",
      },
    },
    { $unwind: "$challenge" },
    {
      $group: {
        _id: null,
        totalPoints: { $sum: { $add: ["$challenge.points", { $ifNull: ["$bonusPoints", 0] }] } },
      },
    },
  ]);

  const unlockedHints = await mongoAggregate<any>("unlocked_hints", [
    { $match: { userId: session.userId } },
    { $group: { _id: null, totalCost: { $sum: "$cost" } } }
  ]);

  const currentPoints = (solveData[0]?.totalPoints || 0) - (unlockedHints[0]?.totalCost || 0);

  if (currentPoints < hintCost) {
    return NextResponse.json({ error: "Not enough points to unlock this hint." }, { status: 400 });
  }

  // Record the unlock
  await unlockHint(session.userId, id, hintIndex, hintCost);

  return NextResponse.json({ 
    success: true, 
    content: challenge.hints[hintIndex].content 
  });
}
