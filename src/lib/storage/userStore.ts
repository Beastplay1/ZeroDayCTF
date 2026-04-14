import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import {
  isMongoDataApiConfigured,
  isMongoNativeConfigured,
  mongoFindMany,
  mongoFindOne,
  mongoInsertOne,
  mongoUpdateOne,
} from "@/lib/db/mongodb";
import { generateDiscriminator } from "@/lib/auth/discriminator";

export type NewUser = {
  username: string;
  email: string;
  password: string;
};

export type UserRole = "admin" | "user";

export type StoredUser = {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
  usernum: number; // Unique number for username#number
  role: UserRole;
};

function parseUsernameTag(identifier: string): {
  username: string;
  usernum: number;
} | null {
  const trimmed = identifier.trim();
  const match = /^(.+?)#(\d+)$/.exec(trimmed);
  if (!match) return null;

  const username = match[1].trim();
  const usernum = Number.parseInt(match[2], 10);
  if (!username || Number.isNaN(usernum) || usernum <= 0) return null;

  return { username, usernum };
}

let mongoMigrationDone = false;

/**
 * Formats username#number for display.
 * Pads number to 4 digits if < 10000, else displays as-is.
 * Example: test#0001, test#10000
 */
export function formatUsernameNumber(
  username: string,
  usernum: number,
): string {
  const formattedNumber =
    usernum < 10000 ? usernum.toString().padStart(4, "0") : usernum.toString();
  return `${username}#${formattedNumber}`;
}

const getFilePath = () =>
  path.join(path.resolve(process.cwd(), "data"), "users.json");

async function readFileUsers(): Promise<StoredUser[]> {
  try {
    const raw = await fs.readFile(getFilePath(), "utf8");
    const users = JSON.parse(raw);
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
}

// Duplicate checks
async function writeFileUsers(users: StoredUser[]): Promise<void> {
  const dataDir = path.resolve(process.cwd(), "data");
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(getFilePath(), JSON.stringify(users, null, 2), "utf8");
}

async function migrateFileUsersToMongoIfNeeded(): Promise<void> {
  if (
    !(isMongoDataApiConfigured() || isMongoNativeConfigured()) ||
    mongoMigrationDone
  )
    return;

  const fileUsers = await readFileUsers();

  for (const user of fileUsers) {
    await mongoUpdateOne(
      "users",
      { id: user.id },
      { $setOnInsert: user },
      true,
    );
  }

  mongoMigrationDone = true;
}

function throwDuplicateError(type: "username" | "email"): never {
  const err = new Error(
    type === "username" ? "Username already exists" : "Email already exists",
  ) as Error & { code: string };
  err.code = type === "username" ? "DUPLICATE_USERNAME" : "DUPLICATE_EMAIL";
  throw err;
}

async function createStoredUser(
  usersCount: number,
  username: string,
  email: string,
  password: string,
) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  const usernum = await generateDiscriminator(username);

  return {
    id: usersCount + 1,
    username,
    email,
    passwordHash: hash,
    salt,
    createdAt: new Date().toISOString(),
    usernum,
    role: "user",
  } as StoredUser;
}

export async function saveUser({
  username,
  email,
  password,
}: NewUser): Promise<StoredUser> {
  if (isMongoDataApiConfigured() || isMongoNativeConfigured()) {
    await migrateFileUsersToMongoIfNeeded();

    const existingEmail = await mongoFindOne<StoredUser>("users", { email });
    if (existingEmail) throwDuplicateError("email");

    const latestUser = await mongoFindMany<StoredUser>(
      "users",
      {},
      { id: -1 },
      1,
    );
    const newUser = await createStoredUser(
      latestUser[0]?.id || 0,
      username,
      email,
      password,
    );

    await mongoInsertOne("users", newUser);
    return newUser;
  }

  const users = await readFileUsers();
  // Username uniqueness is no longer enforced
  if (users.find((u) => u.email === email)) throwDuplicateError("email");

  const newUser = await createStoredUser(
    users.length > 0 ? users[users.length - 1].id : 0,
    username,
    email,
    password,
  );

  users.push(newUser);
  await writeFileUsers(users);
  return newUser;
}

export async function verifyUser(
  identifier: string,
  password: string,
): Promise<StoredUser | null> {
  const parsedTag = parseUsernameTag(identifier);

  if (isMongoDataApiConfigured() || isMongoNativeConfigured()) {
    await migrateFileUsersToMongoIfNeeded();
    const byEmail = await mongoFindOne<StoredUser>("users", {
      email: identifier,
    });
    const byUsernameTag = parsedTag
      ? await mongoFindOne<StoredUser>("users", {
          username: parsedTag.username,
          usernum: parsedTag.usernum,
        })
      : null;
    const found =
      byEmail || byUsernameTag || (await mongoFindOne<StoredUser>("users", { username: identifier }));

    if (!found) return null;

    const hash = crypto.scryptSync(password, found.salt, 64).toString("hex");
    return hash === found.passwordHash ? found : null;
  }

  const users = await readFileUsers();
  const found = users.find((u) => {
    if (u.email === identifier) return true;
    if (parsedTag) {
      return u.username === parsedTag.username && u.usernum === parsedTag.usernum;
    }
    return u.username === identifier;
  });
  if (!found) return null;

  const hash = crypto.scryptSync(password, found.salt, 64).toString("hex");
  return hash === found.passwordHash ? found : null;
}

export async function getUserById(userId: number): Promise<StoredUser | null> {
  if (isMongoDataApiConfigured() || isMongoNativeConfigured()) {
    await migrateFileUsersToMongoIfNeeded();
    return mongoFindOne<StoredUser>("users", { id: userId });
  }

  const users = await readFileUsers();
  return users.find((u) => u.id === userId) || null;
}
