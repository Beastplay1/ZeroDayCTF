import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies, createSessionToken, getSessionCookieName } from "@/lib/auth/session";
import { getUserById, updateUser, StoredUser } from "@/lib/storage/userStore";
import { createVerificationToken } from "@/lib/storage/tokenStore";
import { sendVerificationEmail } from "@/lib/mail";
import crypto from "crypto";

export async function PUT(req: NextRequest) {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { username, email, oldPassword, newPassword, avatarUrl } = body;

    const user = await getUserById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updates: Partial<StoredUser> = {};
    let sessionNeedsUpdate = false;

    let requiresLogout = false;

    // Password Update
    if (newPassword) {
      if (!oldPassword) {
        return NextResponse.json({ error: "Current password is required to set a new password." }, { status: 400 });
      }
      
      const oldHash = crypto.scryptSync(oldPassword, user.salt, 64).toString("hex");
      if (oldHash !== user.passwordHash) {
        return NextResponse.json({ error: "Incorrect current password." }, { status: 400 });
      }

      const newSalt = crypto.randomBytes(16).toString("hex");
      const newHash = crypto.scryptSync(newPassword, newSalt, 64).toString("hex");
      updates.salt = newSalt;
      updates.passwordHash = newHash;
      requiresLogout = true;
    }

    // Avatar Update
    if (avatarUrl !== undefined) {
      updates.avatarUrl = avatarUrl.trim() === "" ? undefined : avatarUrl;
    }

    // Username Update
    if (username && username.trim() !== "" && username !== user.username) {
      updates.username = username.trim();
      sessionNeedsUpdate = true;
    }

    // Email Update
    if (email && email.trim() !== "" && email !== user.email) {
      if (!oldPassword) {
        return NextResponse.json({ error: "Current password is required to change email." }, { status: 400 });
      }
      // Only verify if we haven't already verified it for password change
      if (!newPassword) {
        const oldHash = crypto.scryptSync(oldPassword, user.salt, 64).toString("hex");
        if (oldHash !== user.passwordHash) {
          return NextResponse.json({ error: "Incorrect current password." }, { status: 400 });
        }
      }
      
      updates.email = email.trim();
      updates.isEmailVerified = false;
      
      // Send verification email to the NEW email
      try {
        const token = await createVerificationToken(email.trim());
        await sendVerificationEmail(email.trim(), token);
      } catch (mailError) {
        console.error("Failed to send verification email for new address:", mailError);
      }

      requiresLogout = true;
    }

    if (Object.keys(updates).length > 0) {
      await updateUser(user.id, updates);
    }

    const res = NextResponse.json({ success: true, user: { ...user, ...updates }, loggedOut: requiresLogout });

    if (requiresLogout) {
      res.cookies.delete(getSessionCookieName());
    } else if (sessionNeedsUpdate && updates.username) {
      const newToken = createSessionToken(session.userId, updates.username, true, session.role);
      res.cookies.set(getSessionCookieName(), newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    return res;
  } catch (err: any) {
    if (err.code === 11000) {
      return NextResponse.json({ error: "Email or username is already taken." }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }
}
