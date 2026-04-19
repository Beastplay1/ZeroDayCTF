// Web Crypto (HMAC) — как adminSession, для Edge/Node.

const GUEST_COOKIE = "zeroday_guest";
const GUEST_TTL_SEC = 60 * 60 * 24; // 24h

export type GuestSessionPayload = {
  guestId: string;
  role: "guest";
  exp: number;
};

function getGuestSecret(): string {
  if (
    !process.env.GUEST_SESSION_SECRET &&
    process.env.NODE_ENV === "production"
  ) {
    throw new Error("GUEST_SESSION_SECRET is required in production");
  }
  return process.env.GUEST_SESSION_SECRET || "dev-guest-secret-change-me";
}

async function getHmacKey(): Promise<CryptoKey> {
  const secretBytes = new TextEncoder().encode(getGuestSecret());
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

function base64urlEncode(str: string): string {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function base64urlDecode(b64url: string): string {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  return atob(b64);
}

export async function createGuestSessionToken(guestId: string): Promise<string> {
  const payload: GuestSessionPayload = {
    guestId,
    role: "guest",
    exp: Math.floor(Date.now() / 1000) + GUEST_TTL_SEC,
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

export async function parseGuestSessionToken(
  token: string | undefined,
): Promise<GuestSessionPayload | null> {
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
    ) as GuestSessionPayload;
    if (payload.role !== "guest" || !payload.guestId) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getGuestCookieName(): string {
  return GUEST_COOKIE;
}

export function newGuestId(): string {
  return crypto.randomUUID();
}
