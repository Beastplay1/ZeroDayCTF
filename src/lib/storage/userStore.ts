import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

type NewUser = {
  username: string;
  email: string;
  password: string;
};

type StoredUser = {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
};

export async function saveUser({
  username,
  email,
  password,
}: NewUser): Promise<StoredUser> {
  const dataDir = path.resolve(process.cwd(), "data");
  await fs.mkdir(dataDir, { recursive: true });
  const filePath = path.join(dataDir, "users.json");

  let users: StoredUser[] = [];
  try {
    const raw = await fs.readFile(filePath, "utf8");
    users = JSON.parse(raw);
    if (!Array.isArray(users)) users = [];
  } catch (e) {
    // file likely doesn't exist yet; proceed with empty array
    users = [];
  }

  // Duplicate checks
  if (users.find((u) => u.username === username)) {
    const err: any = new Error("Username already exists");
    err.code = "DUPLICATE_USERNAME";
    throw err;
  }
  if (users.find((u) => u.email === email)) {
    const err: any = new Error("Email already exists");
    err.code = "DUPLICATE_EMAIL";
    throw err;
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");

  const newUser: StoredUser = {
    id: users.length > 0 ? users[users.length - 1].id + 1 : 1,
    username,
    email,
    passwordHash: hash,
    salt,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  await fs.writeFile(filePath, JSON.stringify(users, null, 2), "utf8");
  return newUser;
}

export async function verifyUser(
  identifier: string,
  password: string,
): Promise<StoredUser | null> {
  const filePath = path.join(path.resolve(process.cwd(), "data"), "users.json");
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const users: StoredUser[] = JSON.parse(raw);
    const found = users.find(
      (u) => u.email === identifier || u.username === identifier,
    );
    if (!found) return null;

    const hash = crypto.scryptSync(password, found.salt, 64).toString("hex");
    if (hash === found.passwordHash) return found;
    return null;
  } catch (e) {
    return null;
  }
}
