import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth/session";
import { getChallengeById } from "@/lib/storage/challengeStore";
import { getUnlockedHintsForUser } from "@/lib/storage/hintStore";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSessionFromCookies();

  const challenge = await getChallengeById(id);
  if (!challenge) {
    return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
  }

  const unlockedIndices = session 
    ? await getUnlockedHintsForUser(session.userId, id)
    : [];

  const hints = (challenge.hints || []).map((hint, index) => {
    const isUnlocked = unlockedIndices.includes(index);
    return {
      index,
      cost: hint.cost,
      content: isUnlocked ? hint.content : null,
      isUnlocked
    };
  });

  return NextResponse.json({ hints });
}
