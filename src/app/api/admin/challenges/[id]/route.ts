import { NextRequest, NextResponse } from "next/server";
import {
  getChallengeById,
  updateChallenge,
  deleteChallenge,
} from "@/lib/storage/challengeStore";

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

  await deleteChallenge(id);
  return NextResponse.json({ ok: true });
}
