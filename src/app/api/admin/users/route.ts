import { NextResponse } from "next/server";
import { mongoAggregate } from "@/lib/db/mongodb";

export async function GET() {
  try {
    const pipeline: Record<string, unknown>[] = [
      // 1. Считаем сумму за подсказки для каждого юзера
      {
        $lookup: {
          from: "unlocked_hints",
          localField: "id",
          foreignField: "userId",
          as: "userHints",
        },
      },
      {
        $addFields: {
          hintCosts: { $sum: "$userHints.cost" }
        }
      },
      // 2. Считаем сумму за решенные таски
      {
        $lookup: {
          from: "solves",
          localField: "id",
          foreignField: "userId",
          as: "userSolves",
        },
      },
      {
        $unwind: { path: "$userSolves", preserveNullAndEmptyArrays: true }
      },
      {
        $addFields: {
          challengeObjectId: { $toObjectId: "$userSolves.challengeId" }
        }
      },
      {
        $lookup: {
          from: "challenges",
          localField: "challengeObjectId",
          foreignField: "_id",
          as: "challengeData"
        }
      },
      { $unwind: { path: "$challengeData", preserveNullAndEmptyArrays: true } },
      // 3. Группируем всё обратно
      {
        $group: {
          _id: "$id",
          username: { $first: "$username" },
          userTag: { $first: "$userTag" },
          email: { $first: "$email" },
          role: { $first: "$role" },
          avatarUrl: { $first: "$avatarUrl" },
          createdAt: { $first: "$createdAt" },
          bonusPoints: { $first: "$bonusPoints" },
          hintCosts: { $first: "$hintCosts" },
          solvePoints: { $sum: "$challengeData.points" },
          solveCount: { $sum: { $cond: [{ $ifNull: ["$userSolves", false] }, 1, 0] } },
        }
      },
      {
        $addFields: {
          id: "$_id",
          totalPoints: { 
            $subtract: [
              { $add: [{ $ifNull: ["$solvePoints", 0] }, { $ifNull: ["$bonusPoints", 0] }] },
              { $ifNull: ["$hintCosts", 0] }
            ] 
          }
        }
      },
      { $sort: { createdAt: -1 } },
    ];

    const users = await mongoAggregate<any>("users", pipeline);

    return NextResponse.json({ users });
  } catch (err) {
    console.error("[admin/users GET]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
