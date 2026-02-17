import { NextRequest, NextResponse } from "next/server";
import { validateEmail } from "@/lib/validations/validateEmail";
import { validateUsername } from "@/lib/validations/validateUsername";
import { verifyUser } from "@/lib/storage/userStore";

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { identifier, password } = body; // identifier = email or username

    if (!identifier || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    // Basic validation: accept either a valid email or a valid username
    const isEmail = validateEmail(identifier).isValid;
    const isUsername = validateUsername(identifier).isValid;
    if (!isEmail && !isUsername) {
      return NextResponse.json({ error: "Invalid email or username" }, { status: 400 });
    }

    const user = await verifyUser(identifier, password);
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // On success, send a redirect response (301) to /profile
    const redirectUrl = new URL("/profile", request.url);
    return NextResponse.redirect(redirectUrl, 301);
  } catch (e) {
    console.error("Signin error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
};
