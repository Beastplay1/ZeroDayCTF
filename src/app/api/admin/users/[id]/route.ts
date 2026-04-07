import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import {
  mongoFindOne,
  mongoFindMany,
  mongoDeleteOne,
  mongoDeleteMany,
  mongoUpdateOne,
} from "@/lib/db/mongodb";

interface UserDoc {
  id: number;
  username: string;
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
