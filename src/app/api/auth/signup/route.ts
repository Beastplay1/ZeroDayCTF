import { NextRequest, NextResponse } from "next/server";
import { validateUsername } from "@/lib/validations/validateUsername";

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { username, email, password, confirmPassword, agreeToTerms } = body;

    const validation = validateUsername(username);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error || "Invalid username" },
        { status: 400 }
      );
    }

    console.log("Signup request received:", { username, password });
    return NextResponse.json(
      { message: "User signed up successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
