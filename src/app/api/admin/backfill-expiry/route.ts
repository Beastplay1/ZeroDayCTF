import { NextResponse } from "next/server";
import { mongoFindMany, mongoUpdateOne } from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  const challenges = await mongoFindMany("challenges", {});
  let updated = 0;
  for (const c of challenges as any[]) {
    if (!c.expiresAt) {
      const exp = new Date(); // Start from NOW so they don't instantly expire
      if (c.type === "weekly") exp.setDate(exp.getDate() + 7);
      if (c.type === "daily") exp.setHours(exp.getHours() + 24);
      
      await mongoUpdateOne("challenges", { _id: new ObjectId(c._id) as any }, { $set: { expiresAt: exp.toISOString() } });
      updated++;
    }
  }
  return NextResponse.json({ success: true, updated });
}
