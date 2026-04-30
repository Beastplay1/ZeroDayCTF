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
import { generateUserTag } from "@/lib/auth/discriminator";

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
  /** Короткий публичный суффикс после # (hex), глобально уникален. */
  userTag: string;
  role: UserRole;
  avatarUrl?: string;
  isEmailVerified: boolean;
  bonusPoints: number;
};

let mongoMigrationDone = false;

/** Публичный ник: `username#tag` или без тега, если ещё не задан. */
export function formatUserDisplayHandle(user: {
  username: string;
  userTag?: string;
}): string {
  if (user.userTag) {
    return `${user.username}#${user.userTag}`;
  }
  return user.username;
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
  const userTag = await generateUserTag();

  return {
    id: usersCount + 1,
    username,
    email,
    passwordHash: hash,
    salt,
    createdAt: new Date().toISOString(),
    userTag,
    role: "user",
    isEmailVerified: false,
    bonusPoints: 0,
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

    // Get max ID from users collection
    const latestUser = await mongoFindMany<StoredUser>(
      "users",
      {},
      { id: -1 },
      1,
    );
    const maxUserTableId = latestUser[0]?.id || 0;

    // Also check max userId in solves to avoid reusing IDs of deleted users
    const latestSolve = await mongoFindMany<{ userId: number }>(
      "solves",
      {},
      { userId: -1 },
      1,
    );
    const maxSolveUserId = latestSolve[0]?.userId || 0;

    const maxId = Math.max(maxUserTableId, maxSolveUserId);

    const newUser = await createStoredUser(
      maxId,
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
  if (isMongoDataApiConfigured() || isMongoNativeConfigured()) {
    await migrateFileUsersToMongoIfNeeded();
    const found = await mongoFindOne<StoredUser>("users", {
      email: identifier,
    });

    if (!found) return null;

    const hash = crypto.scryptSync(password, found.salt, 64).toString("hex");
    return hash === found.passwordHash ? found : null;
  }

  const users = await readFileUsers();
  const found = users.find((u) => u.email === identifier);
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

export async function updateUser(
  userId: number,
  data: Partial<StoredUser>,
): Promise<void> {
  if (isMongoDataApiConfigured() || isMongoNativeConfigured()) {
    await migrateFileUsersToMongoIfNeeded();
    await mongoUpdateOne("users", { id: userId }, { $set: data });
    return;
  }

  const users = await readFileUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index !== -1) {
    users[index] = { ...users[index], ...data };
    await writeFileUsers(users);
  }
}
