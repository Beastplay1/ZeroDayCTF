import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import {
  mongoFindOne,
  mongoFindMany,
  mongoDeleteOne,
  mongoDeleteMany,
  mongoUpdateOne,
  mongoAggregate,
} from "@/lib/db/mongodb";

interface UserDoc {
  id: number;
  username: string;
  email: string;
  salt: string;
  passwordHash: string;
}

interface SolveDoc {
  challengeId: string;
  userId: number;
  username: string;
  solvedAt: string;
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const userId = parseInt(id, 10);

  if (isNaN(userId)) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  const user = await mongoFindOne<UserDoc>("users", { id: userId });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // 1. Найти все solve'ы пользователя (нужны challengeId для декремента)
  const solves = await mongoFindMany<SolveDoc>("solves", { userId });

  // 2. Для каждого challenge — декрементировать solves и переназначить firstBlood если нужно
  await Promise.all(
    solves.map(async (solve) => {
      let oid: ObjectId;
      try {
        oid = new ObjectId(solve.challengeId);
      } catch {
        return;
      }

      // Декрементируем счётчик solves (не ниже 0)
      await mongoUpdateOne(
        "challenges",
        { _id: oid as unknown as Record<string, unknown>, solves: { $gt: 0 } },
        { $inc: { solves: -1 } },
      );

      // Если firstBlood — удаляемый пользователь, ищем следующего по дате
      const allSolvesForChallenge = await mongoFindMany<SolveDoc>(
        "solves",
        { challengeId: solve.challengeId, userId: { $ne: userId } },
        { solvedAt: 1 },
        1,
      );

      const newFirstBlood = allSolvesForChallenge[0]?.username ?? null;

      await mongoUpdateOne(
        "challenges",
        {
          _id: oid as unknown as Record<string, unknown>,
          firstBlood: user.username,
        },
        { $set: { firstBlood: newFirstBlood } },
      );
    }),
  );

  // 3. Удалить все solve'ы пользователя
  await mongoDeleteMany("solves", { userId });

  // 4. Удалить самого пользователя
  await mongoDeleteOne("users", { id: userId });

  return NextResponse.json({ success: true, deleted: user.username });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const userId = parseInt(id, 10);

  if (isNaN(userId)) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  const body = await req.json();
  const { username, email, role, avatarUrl, password, totalPoints } = body;

  const user = await mongoFindOne<UserDoc>("users", { id: userId });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const updates: Record<string, any> = {};

  if (username && username.trim() !== "") updates.username = username.trim();
  if (email && email.trim() !== "") updates.email = email.trim();
  if (role) updates.role = role;
  if (avatarUrl !== undefined) {
    updates.avatarUrl = avatarUrl.trim() === "" ? undefined : avatarUrl;
  }
  
  if (totalPoints !== undefined) {
    const desiredTotal = parseInt(totalPoints, 10) || 0;
    
    // Calculate current solve points and hint costs to find the required bonus
    const solveData = await mongoAggregate<any>("solves", [
      { $match: { userId: userId } },
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
      { $group: { _id: null, total: { $sum: "$challenge.points" } } }
    ]);
    
    const hintData = await mongoAggregate<any>("unlocked_hints", [
      { $match: { userId: userId } },
      { $group: { _id: null, total: { $sum: "$cost" } } }
    ]);
    
    const solvePoints = solveData[0]?.total || 0;
    const hintCosts = hintData[0]?.total || 0;
    
    // Formula: Total = Solves + Bonus - Hints => Bonus = Total - Solves + Hints
    updates.bonusPoints = desiredTotal - solvePoints + hintCosts;
  }
  
  if (password && password.trim() !== "") {
    const crypto = await import("crypto");
    const newSalt = crypto.randomBytes(16).toString("hex");
    const newHash = crypto.scryptSync(password, newSalt, 64).toString("hex");
    updates.salt = newSalt;
    updates.passwordHash = newHash;
  }

  if (Object.keys(updates).length > 0) {
    try {
      await mongoUpdateOne("users", { id: userId }, { $set: updates });
    } catch (err: any) {
      if (err.code === 11000) {
        return NextResponse.json({ error: "Username or Email already taken" }, { status: 400 });
      }
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
