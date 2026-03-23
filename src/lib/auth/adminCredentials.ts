import crypto from "crypto";

export type AdminUser = {
  username: string;
  passwordHash: string; // scrypt hash: hash:salt
  role: "admin" | "mod";
};

function getAdminUsers(): AdminUser[] {
  const raw = process.env.ADMIN_USERS;
  if (!raw) return [];
  try {
    return JSON.parse(raw) as AdminUser[];
  } catch {
    return [];
  }
}

/**
 * Verifies admin credentials.
 * passwordHash format: "<hash>:<salt>" (scrypt, 64-byte output, hex-encoded)
 */
export function verifyAdminCredentials(
  username: string,
  password: string,
): AdminUser | null {
  const admins = getAdminUsers();
  const admin = admins.find((a) => a.username === username);
  if (!admin) return null;

  const [hash, salt] = admin.passwordHash.split(":");
  if (!hash || !salt) return null;

  try {
    const inputHash = crypto.scryptSync(password, salt, 64).toString("hex");
    if (!crypto.timingSafeEqual(Buffer.from(inputHash), Buffer.from(hash))) {
      return null;
    }
    return admin;
  } catch {
    return null;
  }
}

/**
 * Helper to generate a passwordHash string for adding to ADMIN_USERS env var.
 * Run once in a script: node -e "require('./src/lib/auth/adminCredentials').hashAdminPassword('yourpassword')"
 */
export function hashAdminPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${hash}:${salt}`;
}
