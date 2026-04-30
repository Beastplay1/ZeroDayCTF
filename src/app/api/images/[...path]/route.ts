import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

// Allowed directories within public/ that can be served
const ALLOWED_DIRS = ["avatars", "team_avatars"];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: segments } = await params;

    if (!segments || segments.length < 2) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // First segment must be an allowed directory
    const dir = segments[0];
    if (!ALLOWED_DIRS.includes(dir)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Prevent path traversal
    const filename = segments.slice(1).join("/");
    if (filename.includes("..") || filename.includes("~")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const filePath = path.join(process.cwd(), "public", dir, filename);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext];

    if (!contentType) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    const fileBuffer = await fs.readFile(filePath);

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
