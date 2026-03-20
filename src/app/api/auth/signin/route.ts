import { NextRequest, NextResponse } from "next/server";
import { validateEmail } from "@/lib/validations/validateEmail";
import { validateUsername } from "@/lib/validations/validateUsername";
import { verifyUser } from "@/lib/storage/userStore";
import { createSessionToken, getSessionCookieName } from "@/lib/auth/session";

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { identifier, password, rememberMe } = body; // identifier = email or username

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Missing credentials" },
        { status: 400 },
      );
    }

    const isEmail = validateEmail(identifier).isValid;
    const isUsername = validateUsername(identifier).isValid;
    if (!isEmail && !isUsername) {
      return NextResponse.json(
        { error: "Invalid email or username" },
        { status: 400 },
      );
    }

    const user = await verifyUser(identifier, password);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const token = createSessionToken(
      user.id,
      user.username,
      Boolean(rememberMe),
    );
    const response = NextResponse.json(
      { message: "Authenticated" },
      { status: 200 },
    );

    response.cookies.set({
      name: getSessionCookieName(),
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24,
    });

    return response;
  } catch (e) {
    console.error("Signin error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
};
