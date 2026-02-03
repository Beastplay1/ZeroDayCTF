import { NextRequest, NextResponse } from "next/server";
import { validateUsername } from "@/lib/validations/validateUsername";
import { validateEmail } from "@/lib/validations/validateEmail";

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

    console.log("Signup request received:", { username, password });
    return NextResponse.json(
      { message: "User signed up successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
};
