import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import {
  isMongoDataApiConfigured,
  mongoFindMany,
  mongoFindOne,
  mongoInsertOne,
  mongoUpdateOne,
} from "@/lib/db/mongodb";

export type NewUser = {
  username: string;
  email: string;
  password: string;
};

export type StoredUser = {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
};

let mongoMigrationDone = false;

const getFilePath = () => path.join(path.resolve(process.cwd(), "data"), "users.json");

async function readFileUsers(): Promise<StoredUser[]> {
  try {
    const raw = await fs.readFile(getFilePath(), "utf8");
    const users = JSON.parse(raw);
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
}

async function writeFileUsers(users: StoredUser[]): Promise<void> {
  const dataDir = path.resolve(process.cwd(), "data");
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(getFilePath(), JSON.stringify(users, null, 2), "utf8");
}

async function migrateFileUsersToMongoIfNeeded(): Promise<void> {
  if (!isMongoDataApiConfigured() || mongoMigrationDone) return;

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
  const err = new Error(type === "username" ? "Username already exists" : "Email already exists") as Error & { code: string };
  err.code = type === "username" ? "DUPLICATE_USERNAME" : "DUPLICATE_EMAIL";
  throw err;
}

async function createStoredUser(usersCount: number, username: string, email: string, password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");

  return {
    id: usersCount + 1,
    username,
    email,
    passwordHash: hash,
    salt,
    createdAt: new Date().toISOString(),
  } as StoredUser;
}

export async function saveUser({ username, email, password }: NewUser): Promise<StoredUser> {
  if (isMongoDataApiConfigured()) {
    await migrateFileUsersToMongoIfNeeded();

    const existingUsername = await mongoFindOne<StoredUser>("users", { username });
    if (existingUsername) throwDuplicateError("username");

    const existingEmail = await mongoFindOne<StoredUser>("users", { email });
    if (existingEmail) throwDuplicateError("email");

    const latestUser = await mongoFindMany<StoredUser>("users", {}, { id: -1 }, 1);
    const newUser = await createStoredUser(latestUser[0]?.id || 0, username, email, password);

    await mongoInsertOne("users", newUser);
    return newUser;
  }

  const users = await readFileUsers();
  if (users.find((u) => u.username === username)) throwDuplicateError("username");
  if (users.find((u) => u.email === email)) throwDuplicateError("email");

  const newUser = await createStoredUser(users.length > 0 ? users[users.length - 1].id : 0, username, email, password);
  users.push(newUser);
  await writeFileUsers(users);
  return newUser;
}

export async function verifyUser(identifier: string, password: string): Promise<StoredUser | null> {
  if (isMongoDataApiConfigured()) {
    await migrateFileUsersToMongoIfNeeded();
    const byEmail = await mongoFindOne<StoredUser>("users", { email: identifier });
    const found = byEmail || (await mongoFindOne<StoredUser>("users", { username: identifier }));

    if (!found) return null;

    const hash = crypto.scryptSync(password, found.salt, 64).toString("hex");
    return hash === found.passwordHash ? found : null;
  }

  const users = await readFileUsers();
  const found = users.find((u) => u.email === identifier || u.username === identifier);
  if (!found) return null;

  const hash = crypto.scryptSync(password, found.salt, 64).toString("hex");
  return hash === found.passwordHash ? found : null;
}

export async function getUserById(userId: number): Promise<StoredUser | null> {
  if (isMongoDataApiConfigured()) {
    await migrateFileUsersToMongoIfNeeded();
    return mongoFindOne<StoredUser>("users", { id: userId });
  }

  const users = await readFileUsers();
  return users.find((u) => u.id === userId) || null;
}
