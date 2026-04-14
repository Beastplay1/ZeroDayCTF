import { mongoFindOne } from "@/lib/db/mongodb";

const MIN_USERNUM = 1;
const MAX_USERNUM = 9999;
const MAX_ATTEMPTS = 30;

export function formatUsernum(usernum: number): string {
  return usernum.toString().padStart(4, "0");
}

export function formatUsernameTag(username: string, usernum: number): string {
  return `${username}#${formatUsernum(usernum)}`;
}

function generateRandomUsernum(): number {
  return Math.floor(Math.random() * (MAX_USERNUM - MIN_USERNUM + 1)) + MIN_USERNUM;
}

export async function generateDiscriminator(username: string): Promise<number> {
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const usernum = generateRandomUsernum();

    // Проверяем уникальность только для конкретного username
    const existing = await mongoFindOne("users", { username, usernum });

    if (!existing) {
      return usernum;
    }
  }

  throw new Error(
    "Failed to generate a unique #number. Please retry registration.",
  );
}
