import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth/session";
import { mongoFindOne } from "@/lib/db/mongodb";
import { StoredUser } from "@/lib/storage/userStore";
import { createVerificationToken } from "@/lib/storage/tokenStore";
import { sendVerificationEmail } from "@/lib/mail";

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await mongoFindOne<StoredUser>("users", { id: session.userId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.isEmailVerified) {
      return NextResponse.json({ error: "Email is already verified" }, { status: 400 });
    }

    const token = await createVerificationToken(user.email);
    await sendVerificationEmail(user.email, token);

    return NextResponse.json({ success: true, message: "Verification email sent" });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
