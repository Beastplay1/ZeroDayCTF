import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionFromCookies } from "@/lib/auth/session";
import {
  createGuestSessionToken,
  getGuestCookieName,
  newGuestId,
  parseGuestSessionToken,
} from "@/lib/auth/guestSession";

async function handleEnsure() {
  const userSession = await getSessionFromCookies();
  if (userSession) {
    return NextResponse.json({
      mode: "user" as const,
      userId: userSession.userId,
    });
  }

  const cookieStore = await cookies();
  const existing = cookieStore.get(getGuestCookieName())?.value;
  const parsed = await parseGuestSessionToken(existing);

  if (parsed) {
    return NextResponse.json({
      mode: "guest" as const,
      guestId: parsed.guestId,
    });
  }

  const guestId = newGuestId();
  const token = await createGuestSessionToken(guestId);

  const response = NextResponse.json({
    mode: "guest" as const,
    guestId,
  });

  response.cookies.set({
    name: getGuestCookieName(),
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && process.env.REQUIRE_HTTPS === "true",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return response;
}

/** GET/POST: выставить гостевую cookie при первом заходе (если нет user session). */
export async function GET() {
  return handleEnsure();
}

export async function POST() {
  return handleEnsure();
}
