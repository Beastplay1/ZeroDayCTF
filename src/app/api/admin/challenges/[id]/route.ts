import { NextRequest, NextResponse } from "next/server";
import {
  getChallengeById,
  updateChallenge,
  deleteChallenge,
} from "@/lib/storage/challengeStore";
import { mongoFindMany, mongoUpdateOne, mongoFindOne, mongoDeleteMany } from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";

// PUT /api/admin/challenges/[id] — update challenge
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();

  const existing = await getChallengeById(id);
  if (!existing) {
    return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
  }

  const allowed = [
    "name",
    "category",
    "difficulty",
    "points",
    "description",
    "flag",
    "file",
    "type",
    "active",
    "expiresAt",
  ];
  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) update[key] = body[key];
  }

  if (body.resetExpiry) {
    const type = body.type || existing.type;
    const exp = new Date();
    if (type === "weekly") exp.setDate(exp.getDate() + 7);
    if (type === "daily") exp.setHours(exp.getHours() + 24);
    update.expiresAt = exp.toISOString();
  }

  await updateChallenge(id, update as any);
  return NextResponse.json({ ok: true });
}

// DELETE /api/admin/challenges/[id] — delete challenge
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const existing = await getChallengeById(id);
  if (!existing) {
    return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
  }

  // Use team_solves to find which teams solved this challenge and deduct points
  const teamSolves = await mongoFindMany<any>("team_solves", { challengeId: id });
  
  // For each team that solved this challenge, we need to figure out how many points they got.
  // Points = challenge.points + bonusPoints (from the first team member who solved it)
  const solves = await mongoFindMany<any>("solves", { challengeId: id });
  
  for (const ts of teamSolves) {
    // Find the bonus that the team member who triggered the team solve got
    // This was the first member from that team to solve it
    let teamBonus = 0;
    for (const solve of solves) {
      const user = await mongoFindOne<any>("users", { id: solve.userId });
      if (user && user.teamId === ts.teamId) {
        teamBonus = solve.bonusPoints || 0;
        break; // first one is the one that triggered team_solves
      }
    }
    
    const totalDeduction = existing.points + teamBonus;
    await mongoUpdateOne(
      "teams",
      { _id: new ObjectId(ts.teamId) as any },
      { $inc: { totalPoints: -totalDeduction, totalSolves: -1 } } as any
    );
  }

  // Delete team_solves and solves for this challenge
  await mongoDeleteMany("team_solves", { challengeId: id });
  await mongoDeleteMany("solves", { challengeId: id });

  await deleteChallenge(id);
  return NextResponse.json({ ok: true });
}
