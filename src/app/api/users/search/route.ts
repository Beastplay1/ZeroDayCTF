import { NextRequest, NextResponse } from "next/server";
import { mongoAggregate } from "@/lib/db/mongodb";

interface SearchResult {
  id: number;
  username: string;
  userTag?: string;
  avatarUrl?: string;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";

    if (q.trim().length < 2) {
      return NextResponse.json({ users: [] });
    }

    // Example query: "alexa#7772", "alexa #7772", "#7772" or just "alexa"
    const parts = q.trim().split("#");
    const namePart = parts[0].trim();
    const tagPart = parts[1]?.trim();

    const matchStage: any = {};

    if (namePart) {
      // Case-insensitive search using regex
      matchStage.username = { $regex: namePart, $options: "i" };
    }

    if (tagPart) {
      // Partial match for tag if provided (starts with)
      matchStage.userTag = { $regex: "^" + tagPart, $options: "i" };
    }

    const pipeline: any[] = [
      { $match: matchStage },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          id: 1,
          username: 1,
          userTag: 1,
          avatarUrl: 1,
        },
      },
    ];

    const users = await mongoAggregate<SearchResult>("users", pipeline);

    return NextResponse.json({ users });
  } catch (err) {
    console.error("[api/users/search GET]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
