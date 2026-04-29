import { mongoFindOne, mongoInsertOne, mongoFindMany } from "@/lib/db/mongodb";

export interface UnlockedHint {
  userId: number;
  challengeId: string;
  hintIndex: number;
  cost: number;
  unlockedAt: string;
}

export async function isHintUnlocked(userId: number, challengeId: string, hintIndex: number): Promise<boolean> {
  const found = await mongoFindOne<UnlockedHint>("unlocked_hints", {
    userId,
    challengeId,
    hintIndex
  });
  return !!found;
}

export async function unlockHint(userId: number, challengeId: string, hintIndex: number, cost: number): Promise<void> {
  const alreadyUnlocked = await isHintUnlocked(userId, challengeId, hintIndex);
  if (alreadyUnlocked) return;

  await mongoInsertOne("unlocked_hints", {
    userId,
    challengeId,
    hintIndex,
    cost,
    unlockedAt: new Date().toISOString()
  });
}

export async function getUnlockedHintsForUser(userId: number, challengeId: string): Promise<number[]> {
  const hints = await mongoFindMany<UnlockedHint>("unlocked_hints", {
    userId,
    challengeId
  });
  return hints.map(h => h.hintIndex);
}
