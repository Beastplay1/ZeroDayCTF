import { NextRequest, NextResponse } from "next/server";
import { validateUsername } from "@/lib/validations/validateUsername";
import { validateEmail } from "@/lib/validations/validateEmail";
import { validatePassword } from "@/lib/validations/validatePassword";
import { saveUser } from "@/lib/storage/userStore";
import { createSessionToken, getSessionCookieName } from "@/lib/auth/session";

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { username, email, password, confirmPassword, agreeToTerms } = body;

    const validation = validateUsername(username);
    if (validation.isMalicious) {
      return NextResponse.json(
        { error: validation.error || "Forbidden" },
        { status: 403 },
      );
    }

    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error || "Invalid username" },
        { status: 400 },
      );
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { error: emailValidation.error || "Invalid email" },
        { status: 400 },
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 },
      );
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.error || "Invalid password" },
        { status: 400 },
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 },
      );
    }

    if (!agreeToTerms) {
      return NextResponse.json(
        { error: "You must agree to the terms and conditions" },
        { status: 400 },
      );
    }

    // Persist user
    try {
      const stored = await saveUser({ username, email, password });

      // Create session token and set cookie so user is logged in after signup
      const token = createSessionToken(stored.id, stored.username, false);
      const response = NextResponse.redirect(
        new URL("/profile", request.url),
        302,
      );

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
    } catch (e: any) {
      if (e.code === "DUPLICATE_USERNAME" || e.code === "DUPLICATE_EMAIL") {
        return NextResponse.json({ error: e.message }, { status: 409 });
      }
      console.error("Error saving user:", e);
      return NextResponse.json(
        { error: "Failed to save user" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
};
