import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCredentials } from "@/lib/auth/adminCredentials";
import {
  createAdminSessionToken,
  getAdminSessionCookieName,
} from "@/lib/auth/adminSession";

// In-memory rate limiter: ip → { attempts, blockedUntil }
const rateLimitMap = new Map<
  string,
  { attempts: number; blockedUntil: number }
>();
const MAX_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

function getIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function checkRateLimit(ip: string): {
  blocked: boolean;
  attemptsLeft: number;
} {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (entry && entry.blockedUntil > now) {
    return { blocked: true, attemptsLeft: 0 };
  }

  return {
    blocked: false,
    attemptsLeft: MAX_ATTEMPTS - (entry?.attempts ?? 0),
  };
}

function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const entry = rateLimitMap.get(ip) ?? { attempts: 0, blockedUntil: 0 };

  entry.attempts += 1;
  if (entry.attempts >= MAX_ATTEMPTS) {
    entry.blockedUntil = now + BLOCK_DURATION_MS;
  }
  rateLimitMap.set(ip, entry);
}

function clearAttempts(ip: string): void {
  rateLimitMap.delete(ip);
}

export const POST = async (request: NextRequest) => {
  const ip = getIp(request);
  const { blocked } = checkRateLimit(ip);

  if (blocked) {
    return NextResponse.json(
      { error: "Too many failed attempts. Try again in 15 minutes." },
      { status: 403 },
    );
  }

  let body: { username?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { username, password } = body;
  if (!username || !password) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  }

  const admin = verifyAdminCredentials(username, password);
  if (!admin) {
    recordFailedAttempt(ip);
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  clearAttempts(ip);

  const token = await createAdminSessionToken(admin.username, admin.role);
  const response = NextResponse.json(
    { message: "Authenticated" },
    { status: 200 },
  );

  response.cookies.set({
    name: getAdminSessionCookieName(),
    value: token,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production" && process.env.REQUIRE_HTTPS === "true",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
};
