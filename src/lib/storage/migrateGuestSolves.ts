import { mongoFindMany, mongoInsertOne, mongoDeleteMany } from "@/lib/db/mongodb";
import { recordSolve } from "@/lib/storage/challengeStore";
import { getChallengeById } from "@/lib/storage/challengeStore";

export async function migrateGuestSolves(guestId: string, userId: number, username: string) {
  try {
    const guestSolves = await mongoFindMany<{ challengeId: string; solvedAt: string }>("guest_solves", {
      guestId,
    });

    if (!guestSolves || guestSolves.length === 0) {
      return;
    }

    for (const solve of guestSolves) {
      // Check if user already has this solve just in case
      const existing = await mongoFindMany("solves", {
        challengeId: solve.challengeId,
        userId,
      });

      if (!existing || existing.length === 0) {
        const challenge = await getChallengeById(solve.challengeId);
        const isFirstBlood = challenge ? challenge.solves === 0 : false;

        await Promise.all([
          mongoInsertOne("solves", {
            challengeId: solve.challengeId,
            userId,
            username,
            solvedAt: solve.solvedAt,
          }),
          recordSolve(solve.challengeId, username, isFirstBlood),
        ]);
      }
    }

    // Delete guest solves
    await mongoDeleteMany("guest_solves", { guestId });
  } catch (error) {
    console.error("Error migrating guest solves:", error);
  }
}
