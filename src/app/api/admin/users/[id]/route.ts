import { NextRequest, NextResponse } from "next/server";
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

  // 2. Для каждого challenge — декрементировать solves и сбросить firstBlood если нужно
  await Promise.all(
    solves.map(async (solve) => {
      // Декрементируем счётчик solves
      await mongoUpdateOne(
        "challenges",
        { _id: { $oid: solve.challengeId } },
        { $inc: { solves: -1 } },
      );
      // Если firstBlood — этот пользователь, сбрасываем
      await mongoUpdateOne(
        "challenges",
        { _id: { $oid: solve.challengeId }, firstBlood: user.username },
        { $set: { firstBlood: null } },
      );
    }),
  );

  // 3. Удалить все solve'ы пользователя
  await mongoDeleteMany("solves", { userId });

  // 4. Удалить самого пользователя
  await mongoDeleteOne("users", { id: userId });

  return NextResponse.json({ success: true, deleted: user.username });
}
