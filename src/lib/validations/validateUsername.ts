export type ValidationResult = {
  isValid: boolean;
  error?: string;
  isMalicious?: boolean;
};

const USERNAME_CONSTS = {
  MIN_LENGTH: 3,
  MAX_LENGTH: 20,
  ALLOWED_CHARS: /^[a-zA-Z0-9_.]+$/,
  CONSECUTIVE_DOTS: /[.]{2,}/,
} as const;

export function validateUsername(username: string): ValidationResult {
  // Normalize and remove control characters to avoid obfuscation tricks
  const normalized = username.normalize?.("NFKC") ?? username;
  const withoutControls = normalized.replace(
    /[\u0000-\u001F\u007F-\u009F]/g,
    "",
  );
  const username_trimmed = withoutControls.trim();

  if (!username || username_trimmed === "") {
    return {
      isValid: false,
      error: "Username cannot be empty!",
    };
  }

  if (
    username_trimmed.length < USERNAME_CONSTS.MIN_LENGTH ||
    username_trimmed.length > USERNAME_CONSTS.MAX_LENGTH
  ) {
    return {
      isValid: false,
      error: `Username must be between ${USERNAME_CONSTS.MIN_LENGTH} and ${USERNAME_CONSTS.MAX_LENGTH} characters long.`,
    };
  }
  // If the visible username contains disallowed characters, treat as invalid (400)
  if (!USERNAME_CONSTS.ALLOWED_CHARS.test(username_trimmed)) {
    // Check for percent-encoded payloads which could hide malicious content
    const hasPctEncoded = /%(?:[0-9A-Fa-f]{2})/.test(username_trimmed);
    if (hasPctEncoded) {
      try {
        const decoded = decodeURIComponent(username_trimmed);
        const decodedLower = decoded.toLowerCase();

        // If decoded contains characters that are never allowed in a username
        if (/[<>"'`;\\]/.test(decoded)) {
          return {
            isValid: false,
            isMalicious: true,
            error: "Malicious input detected",
          };
        }

        // Detect clear XSS patterns like <script> or javascript: or on* handlers
        const xssPattern = /<\s*\/??\s*script\b|javascript:\s*|on\w+\s*=/i;
        if (xssPattern.test(decodedLower)) {
          return {
            isValid: false,
            isMalicious: true,
            error: "Malicious input detected",
          };
        }

        // Detect SQL keywords only when combined with whitespace or punctuation
        const sqlKeyword =
          /\b(select|union|insert|update|delete|drop|alter|create|exec)\b/i;
        if (sqlKeyword.test(decodedLower) && /[\s\(\)\'";=\-]/.test(decoded)) {
          return {
            isValid: false,
            isMalicious: true,
            error: "Malicious input detected",
          };
        }
      } catch (e) {
        // ignore decode errors and fall through to regular invalid response
      }
    }

    return {
      isValid: false,
      error:
        "Username can only contain letters, numbers, dots and underscores.",
    };
  }

  const invalidChars = [".", "_"];

  if (
    invalidChars.some(
      (char) =>
        username_trimmed.startsWith(char) || username_trimmed.endsWith(char),
    )
  ) {
    return {
      isValid: false,
      error: "Username cannot start or end with dots or underscores",
    };
  }

  if (USERNAME_CONSTS.CONSECUTIVE_DOTS.test(username_trimmed)) {
    return {
      isValid: false,
      error: "Username cannot contain consecutive dots",
    };
  }

  // Final checks: ensure no surrounding dots/underscores or consecutive dots

  return { isValid: true };
}
