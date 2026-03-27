import { NextResponse } from "next/server";
import { getActiveChallenges } from "@/lib/storage/challengeStore";

export async function GET() {
  const challenges = await getActiveChallenges();
  return NextResponse.json({ challenges });
}
