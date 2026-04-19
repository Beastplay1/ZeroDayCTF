import crypto from "crypto";
import { mongoFindOne } from "@/lib/db/mongodb";

const TAG_LEN = 4;
const MAX_ATTEMPTS = 48;

/**
 * Глобально уникальный короткий тег (hex): `username#a3f2`.
 * Берём 4 подряд символа из SHA-256 случайных байт, со случайным смещением внутри хэша.
 */
export async function generateUserTag(): Promise<string> {
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const digest = crypto
      .createHash("sha256")
      .update(crypto.randomBytes(32))
      .digest("hex");
    const maxStart = digest.length - TAG_LEN;
    const start = Math.floor(Math.random() * (maxStart + 1));
    const tag = digest.slice(start, start + TAG_LEN).toLowerCase();

    const byTag = await mongoFindOne("users", { userTag: tag });
    if (!byTag) {
      return tag;
    }
  }

  throw new Error(
    "Failed to generate a unique tag. Please retry registration.",
  );
}

export function formatUsernameTag(username: string, tag: string): string {
  return `${username}#${tag}`;
}
