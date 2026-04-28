import { mongoInsertOne, mongoFindOne, mongoDeleteMany } from "@/lib/db/mongodb";
import crypto from "crypto";

export type VerificationToken = {
  email: string;
  token: string;
  expiresAt: string;
};

export async function createVerificationToken(email: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString(); // 1 hour

  // Delete any existing tokens for this email
  await mongoDeleteMany("verification_tokens", { email });

  await mongoInsertOne("verification_tokens", {
    email,
    token,
    expiresAt,
  });

  return token;
}

export async function getVerificationTokenByToken(token: string): Promise<VerificationToken | null> {
  return mongoFindOne<VerificationToken>("verification_tokens", { token });
}

export async function deleteVerificationToken(token: string): Promise<void> {
  await mongoDeleteMany("verification_tokens", { token });
}

export type PasswordResetToken = {
  email: string;
  token: string;
  expiresAt: string;
};

export async function createPasswordResetToken(email: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString(); // 1 hour

  await mongoDeleteMany("password_reset_tokens", { email });

  await mongoInsertOne("password_reset_tokens", {
    email,
    token,
    expiresAt,
  });

  return token;
}

export async function getPasswordResetTokenByToken(token: string): Promise<PasswordResetToken | null> {
  return mongoFindOne<PasswordResetToken>("password_reset_tokens", { token });
}

export async function deletePasswordResetToken(token: string): Promise<void> {
  await mongoDeleteMany("password_reset_tokens", { token });
}
