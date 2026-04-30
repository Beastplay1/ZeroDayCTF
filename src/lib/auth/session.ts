import crypto from "crypto";
import { cookies } from "next/headers";
import type { UserRole } from "@/lib/storage/userStore";
import { mongoFindOne } from "@/lib/db/mongodb";

const SESSION_COOKIE = "zeroday_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24;

export type SessionPayload = {
  userId: number;
  username: string;
  role: UserRole;
  exp: number;
};

function getSessionSecret(): string {
  if (!process.env.SESSION_SECRET && process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET environment variable is required in production");
  }
  return process.env.SESSION_SECRET || "dev-session-secret-change-me";
}

function sign(payloadB64: string): string {
  return crypto.createHmac("sha256", getSessionSecret()).update(payloadB64).digest("hex");
}

export function createSessionToken(userId: number, username: string, rememberMe?: boolean, role: UserRole = "user"): string {
  const expiresIn = rememberMe ? 60 * 60 * 24 * 30 : SESSION_TTL_SECONDS;
  const payload: SessionPayload = {
    userId,
    username,
    role,
    exp: Math.floor(Date.now() / 1000) + expiresIn,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = sign(payloadB64);
  return `${payloadB64}.${signature}`;
}

export function parseSessionToken(token: string | undefined): SessionPayload | null {
  if (!token) return null;

  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return null;

  const expectedSignature = sign(payloadB64);
  if (signature.length !== expectedSignature.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8")) as SessionPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getSessionFromCookies(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = parseSessionToken(token);
  if (!session) return null;

  // Verify user still exists in DB — handles deleted accounts automatically
  const userExists = await mongoFindOne<{ id: number }>("users", { id: session.userId });
  if (!userExists) return null;

  return session;
}

/** Alias kept for backwards compatibility — same as getSessionFromCookies. */
export async function getVerifiedSessionFromCookies(): Promise<SessionPayload | null> {
  return getSessionFromCookies();
}

export function getSessionCookieName(): string {
  return SESSION_COOKIE;
}
