import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/config";
import { mongoFindOne } from "@/lib/db/mongodb";
import { createSessionToken, getSessionCookieName } from "@/lib/auth/session";

export const GET = async (request: NextRequest) => {
  // Get NextAuth session
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  // Find user in DB by email
  const user = await mongoFindOne<{
    id: number;
    username: string;
    role?: string;
  }>("users", {
    email: session.user.email,
  });
  if (!user || !user.id) {
    console.error(
      "OAuth session: user not found or missing id for",
      session.user.email,
    );
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  // Create custom session token
  const role = user.role === "admin" ? "admin" : "user";
  const token = createSessionToken(user.id, user.username, false, role);
  const response = NextResponse.redirect(new URL("/profile", request.url), 302);

  response.cookies.set({
    name: getSessionCookieName(),
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return response;
};
