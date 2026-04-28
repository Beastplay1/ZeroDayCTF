import { NextRequest, NextResponse } from "next/server";
import { getPasswordResetTokenByToken, deletePasswordResetToken } from "@/lib/storage/tokenStore";
import { mongoFindOne, mongoUpdateOne } from "@/lib/db/mongodb";
import { StoredUser } from "@/lib/storage/userStore";
import { validatePassword } from "@/lib/validations/validatePassword";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { token, password, confirmPassword } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json({ error: passwordValidation.error }, { status: 400 });
    }

    const resetToken = await getPasswordResetTokenByToken(token);

    if (!resetToken) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    const hasExpired = new Date(resetToken.expiresAt) < new Date();
    if (hasExpired) {
      await deletePasswordResetToken(token);
      return NextResponse.json({ error: "Token has expired" }, { status: 400 });
    }

    const user = await mongoFindOne<StoredUser>("users", { email: resetToken.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Hash new password
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.scryptSync(password, salt, 64).toString("hex");

    await mongoUpdateOne(
      "users",
      { email: resetToken.email },
      { $set: { passwordHash: hash, salt: salt } }
    );

    await deletePasswordResetToken(token);

    return NextResponse.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
