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
  if (!username) {
    return {
      isValid: false,
      error: "Username cannot be empty!",
    };
  }

  const normalized = username.normalize?.("NFKC") ?? username;
  const withoutControls = normalized.replace(
    /[\u0000-\u001F\u007F-\u009F]/g,
    "",
  );
  const username_trimmed = withoutControls.trim();

  if (username_trimmed === "") {
    return {
      isValid: false,
      error: "Username cannot be empty!",
    };
  }

  // Check length
  if (
    username_trimmed.length < USERNAME_CONSTS.MIN_LENGTH ||
    username_trimmed.length > USERNAME_CONSTS.MAX_LENGTH
  ) {
    return {
      isValid: false,
      error: `Username must be between ${USERNAME_CONSTS.MIN_LENGTH} and ${USERNAME_CONSTS.MAX_LENGTH} characters long.`,
    };
  }

  // CHECK FOR MALICIOUS PATTERNS FIRST (before allowed chars check)
  const maliciousCheck = checkMaliciousPatterns(username_trimmed);
  if (maliciousCheck.isMalicious) {
    return maliciousCheck;
  }

  // Now check allowed characters
  if (!USERNAME_CONSTS.ALLOWED_CHARS.test(username_trimmed)) {
    return {
      isValid: false,
      error: "Username can only contain letters, numbers, dots and underscores.",
    };
  }

  // Check start/end characters
  if (username_trimmed.startsWith('.') || username_trimmed.startsWith('_') ||
      username_trimmed.endsWith('.') || username_trimmed.endsWith('_')) {
    return {
      isValid: false,
      error: "Username cannot start or end with dots or underscores",
    };
  }

  // Check consecutive dots
  if (USERNAME_CONSTS.CONSECUTIVE_DOTS.test(username_trimmed)) {
    return {
      isValid: false,
      error: "Username cannot contain consecutive dots",
    };
  }

  return { isValid: true };
}

// Extract malicious pattern checking into separate function
function checkMaliciousPatterns(input: string): ValidationResult {
  // Check for direct dangerous characters
  if (/[<>\"'`;\\(){}[\]]/.test(input)) {
    return {
      isValid: false,
      isMalicious: true,
      error: "Malicious input detected",
    };
  }

  // Check for encoded patterns
  const hasPctEncoded = /%(?:[0-9A-Fa-f]{2})/.test(input);
  const hasHtmlEntities = /&(?:#x?[0-9a-f]+|[a-z]+);/i.test(input);
  
  if (hasPctEncoded || hasHtmlEntities) {
    try {
      let decoded = input;
      
      if (hasPctEncoded) {
        decoded = decodeURIComponent(decoded);
      }
      
      if (hasHtmlEntities) {
        decoded = decoded
          .replace(/&lt;/gi, '<')
          .replace(/&gt;/gi, '>')
          .replace(/&quot;/gi, '"')
          .replace(/&#x27;/gi, "'")
          .replace(/&amp;/gi, '&');
      }

      const decodedLower = decoded.toLowerCase();

      // Dangerous characters after decoding
      if (/[<>\"'`;\\(){}[\]]/.test(decoded)) {
        return {
          isValid: false,
          isMalicious: true,
          error: "Malicious input detected",
        };
      }

      const xssPattern = /<\s*\/?\s*script\b|javascript:\s*|on\w+\s*=|<\s*iframe|<\s*object|<\s*embed/i;
      if (xssPattern.test(decodedLower)) {
        return {
          isValid: false,
          isMalicious: true,
          error: "Malicious input detected",
        };
      }

      const sqlKeyword = /\b(select|union|insert|update|delete|drop|alter|create|exec|execute|declare)\b/i;
      if (sqlKeyword.test(decodedLower) && /[\s\(\)\'";=\-]/.test(decoded)) {
        return {
          isValid: false,
          isMalicious: true,
          error: "Malicious input detected",
        };
      }

      if (/\.\.\/|\.\.\\/.test(decoded)) {
        return {
          isValid: false,
          isMalicious: true,
          error: "Malicious input detected",
        };
      }

    } catch (e) {
      return {
        isValid: false,
        isMalicious: true,
        error: "Malicious input detected",
      };
    }
  }

  return { isValid: true };
}