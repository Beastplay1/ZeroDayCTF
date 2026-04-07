import { NextResponse } from "next/server";
import { mongoAggregate } from "@/lib/db/mongodb";

interface UserWithSolves {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  solveCount: number;
}

export async function GET() {
  try {
    const pipeline: Record<string, unknown>[] = [
      {
        $lookup: {
          from: "solves",
          localField: "id",
          foreignField: "userId",
          as: "userSolves",
        },
      },
      {
        $project: {
          _id: 0,
          id: 1,
          username: 1,
          email: 1,
          role: 1,
          createdAt: 1,
          solveCount: { $size: "$userSolves" },
        },
      },
      { $sort: { createdAt: -1 } },
    ];

    const users = await mongoAggregate<UserWithSolves>("users", pipeline);

    return NextResponse.json({ users });
  } catch (err) {
    console.error("[admin/users GET]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
