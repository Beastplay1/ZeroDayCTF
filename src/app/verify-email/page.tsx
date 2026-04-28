import { getVerificationTokenByToken, deleteVerificationToken } from "@/lib/storage/tokenStore";
import { mongoFindOne, mongoUpdateOne } from "@/lib/db/mongodb";
import { StoredUser } from "@/lib/storage/userStore";
import { getSessionFromCookies } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; email?: string }>;
}) {
  const { token, email } = await searchParams;

  if (!email) {
    redirect("/profile");
  }

  // Check if user is already verified
  const user = await mongoFindOne<StoredUser>("users", { email });
  
  if (user?.isEmailVerified) {
    const session = await getSessionFromCookies();
    // If logged in as THIS user, go to profile, else signin
    if (session && session.userId === user.id) {
      redirect("/profile?message=already_verified");
    } else {
      redirect("/signin?message=already_verified");
    }
  }

  // If not verified, we need a valid token
  if (!token) {
    redirect("/profile");
  }

  const verifToken = await getVerificationTokenByToken(token);

  if (!verifToken || verifToken.email !== email) {
    // Standard 403-ish behavior without forbidden()
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center p-8 border-2 border-red-600 bg-red-600/10 text-white max-w-md">
          <h1 className="text-2xl font-bold mb-4">403 FORBIDDEN</h1>
          <p>Invalid or expired verification token.</p>
          <a href="/profile" className="mt-4 inline-block text-zerogreen underline">Back to Profile</a>
        </div>
      </div>
    );
  }

  const hasExpired = new Date(verifToken.expiresAt) < new Date();
  if (hasExpired) {
    await deleteVerificationToken(token);
    redirect("/profile?message=expired");
  }

  // Mark as verified
  await mongoUpdateOne(
    "users",
    { email },
    { $set: { isEmailVerified: true } }
  );

  // Delete token
  await deleteVerificationToken(token);

  redirect("/profile?message=verified");
}
