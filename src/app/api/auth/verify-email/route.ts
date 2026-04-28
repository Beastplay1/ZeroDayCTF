import { NextRequest, NextResponse } from "next/server";
import { getVerificationTokenByToken, deleteVerificationToken } from "@/lib/storage/tokenStore";
import { mongoFindOne, mongoUpdateOne } from "@/lib/db/mongodb";
import { StoredUser } from "@/lib/storage/userStore";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const verifToken = await getVerificationTokenByToken(token);

  if (!verifToken) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 403 });
  }

  const hasExpired = new Date(verifToken.expiresAt) < new Date();
  if (hasExpired) {
    await deleteVerificationToken(token);
    return NextResponse.json({ error: "Token has expired" }, { status: 403 });
  }

  const user = await mongoFindOne<StoredUser>("users", { email: verifToken.email });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await mongoUpdateOne("users", { email: verifToken.email }, { $set: { isEmailVerified: true } });
  await deleteVerificationToken(token);

  // Instead of a JSON response, we can redirect or let the client handle it.
  // For simplicity, let's return success and the frontend will handle redirect.
  return NextResponse.json({ success: true, message: "Email verified successfully" });
}
