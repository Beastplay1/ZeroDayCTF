// Uses Web Crypto API (SubtleCrypto) — compatible with Edge Runtime and Node.js

const ADMIN_SESSION_COOKIE = "zeroday_admin_session";
const ADMIN_SESSION_TTL = 60 * 60 * 8; // 8 hours

export type AdminSessionPayload = {
  username: string;
  role: "admin" | "mod";
  exp: number;
};

function getAdminSecret(): string {
  if (
    !process.env.ADMIN_SESSION_SECRET &&
    process.env.NODE_ENV === "production"
  ) {
    throw new Error("ADMIN_SESSION_SECRET is required in production");
  }
  return process.env.ADMIN_SESSION_SECRET || "dev-admin-secret-change-me";
}

async function getHmacKey(): Promise<CryptoKey> {
  const secretBytes = new TextEncoder().encode(getAdminSecret());
  return crypto.subtle.importKey(
    "raw",
    secretBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToUint8Array(hex: string): Uint8Array<ArrayBuffer> {
  if (hex.length % 2 !== 0) return new Uint8Array(new ArrayBuffer(0));
  const buf = new ArrayBuffer(hex.length / 2);
  const arr = new Uint8Array(buf);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return arr;
}

// base64url encode without Buffer (Edge-safe)
function base64urlEncode(str: string): string {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

// base64url decode without Buffer (Edge-safe)
function base64urlDecode(b64url: string): string {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  return atob(b64);
}

export async function createAdminSessionToken(
  username: string,
  role: "admin" | "mod",
): Promise<string> {
  const payload: AdminSessionPayload = {
    username,
    role,
    exp: Math.floor(Date.now() / 1000) + ADMIN_SESSION_TTL,
  };
  const payloadB64 = base64urlEncode(JSON.stringify(payload));
  const key = await getHmacKey();
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payloadB64),
  );
  return `${payloadB64}.${bufToHex(sig)}`;
}

export async function parseAdminSessionToken(
  token: string | undefined,
): Promise<AdminSessionPayload | null> {
  if (!token) return null;

  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return null;

  const key = await getHmacKey();
  const sigBytes = hexToUint8Array(signature);
  const data = new TextEncoder().encode(payloadB64);

  const valid = await crypto.subtle.verify("HMAC", key, sigBytes, data);
  if (!valid) return null;

  try {
    const payload = JSON.parse(
      base64urlDecode(payloadB64),
    ) as AdminSessionPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getAdminSessionCookieName(): string {
  return ADMIN_SESSION_COOKIE;
}
