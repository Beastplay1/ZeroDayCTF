import { NextRequest, NextResponse } from "next/server";
import { mongoFindOne } from "@/lib/db/mongodb";
import { StoredUser } from "@/lib/storage/userStore";
import { createPasswordResetToken } from "@/lib/storage/tokenStore";
import { sendPasswordResetEmail } from "@/lib/mail";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await mongoFindOne<StoredUser>("users", { email });

    // For security reasons, don't reveal if the user exists or not
    if (user) {
      const token = await createPasswordResetToken(email);
      await sendPasswordResetEmail(email, token);
    }

    return NextResponse.json({ success: true, message: "If an account with that email exists, we have sent a password reset link." });
  } catch (error) {
    console.error("Password reset request error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
