import { NextRequest, NextResponse } from "next/server";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_CHALLENGES_REPO = process.env.GITHUB_CHALLENGES_REPO ?? "Beastplay1/zerodayctf-challenges";
const GITHUB_BRANCH = process.env.GITHUB_CHALLENGES_BRANCH ?? "main";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filePath = searchParams.get("path");

  if (!filePath) {
    return NextResponse.json({ error: "Missing path" }, { status: 400 });
  }

  // Prevent path traversal
  if (filePath.includes("..") || filePath.startsWith("/")) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  if (!GITHUB_TOKEN) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const rawUrl = `https://raw.githubusercontent.com/${GITHUB_CHALLENGES_REPO}/${GITHUB_BRANCH}/${filePath}`;

  const ghRes = await fetch(rawUrl, {
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
    },
  });

  if (!ghRes.ok) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const filename = filePath.split("/").pop() ?? "download";

  return new NextResponse(ghRes.body, {
    headers: {
      "Content-Type": ghRes.headers.get("Content-Type") ?? "application/octet-stream",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": ghRes.headers.get("Content-Length") ?? "",
    },
  });
}
