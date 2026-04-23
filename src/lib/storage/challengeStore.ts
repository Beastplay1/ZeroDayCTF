import {
  mongoFindOne,
  mongoFindMany,
  mongoInsertOne,
  mongoUpdateOne,
  mongoDeleteOne,
  mongoCount,
} from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";

export interface ChallengeDoc {
  _id?: string;
  name: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Insane";
  points: number;
  description: string;
  flag: string; // never sent to client
  file?: string; // filename, e.g. "classically.zip"
  type: "weekly" | "daily"; // 7-day or 24h
  active: boolean;
  solves: number;
  firstBlood?: string; // username of first solver
  createdAt: string;
  expiresAt?: string; // for daily challenges
}

// Public view — no flag field
export type ChallengePublic = Omit<ChallengeDoc, "flag">;

export async function getChallengeById(
  id: string,
): Promise<ChallengeDoc | null> {
  try {
    return await mongoFindOne<ChallengeDoc>("challenges", {
      _id: new ObjectId(id) as any,
    });
  } catch {
    return null;
  }
}

export async function getActiveChallenges(): Promise<ChallengePublic[]> {
  const docs = await mongoFindMany<ChallengeDoc>(
    "challenges",
    { active: true },
    { createdAt: -1 },
  );
  return docs.map(({ flag: _flag, ...rest }) => rest as ChallengePublic);
}

export async function recordSolve(
  challengeId: string,
  username: string,
  isFirstBlood: boolean,
): Promise<void> {
  const update: Record<string, unknown> = {
    $inc: { solves: 1 },
  };
  if (isFirstBlood) {
    (update as any).$set = { firstBlood: username };
  }
  await mongoUpdateOne(
    "challenges",
    { _id: new ObjectId(challengeId) as any },
    update,
  );
}

export async function getAllChallenges(): Promise<ChallengeDoc[]> {
  return mongoFindMany<ChallengeDoc>("challenges", {}, { createdAt: -1 });
}

export async function createChallenge(
  data: Omit<ChallengeDoc, "_id" | "solves" | "createdAt">,
): Promise<string> {
  const createdAt = new Date();
  let expiresAt = data.expiresAt;
  
  if (!expiresAt) {
    const exp = new Date(createdAt);
    if (data.type === "weekly") exp.setDate(exp.getDate() + 7);
    if (data.type === "daily") exp.setHours(exp.getHours() + 24);
    expiresAt = exp.toISOString();
  }

  const res = await mongoInsertOne("challenges", {
    ...data,
    solves: 0,
    createdAt: createdAt.toISOString(),
    expiresAt,
  });
  return res.insertedId;
}

export async function updateChallenge(
  id: string,
  data: Partial<Omit<ChallengeDoc, "_id" | "solves" | "createdAt">>,
): Promise<void> {
  await mongoUpdateOne(
    "challenges",
    { _id: new ObjectId(id) as any },
    { $set: data },
  );
}

export async function deleteChallenge(id: string): Promise<void> {
  await mongoDeleteOne("challenges", { _id: new ObjectId(id) as any });
}

export async function countChallenges(): Promise<number> {
  return mongoCount("challenges", {});
}

export async function countSolvesToday(): Promise<number> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  return mongoCount("solves", {
    solvedAt: { $gte: startOfDay.toISOString() },
  });
}
