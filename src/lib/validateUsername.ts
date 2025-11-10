export type ValidationResult = {
  isValid: boolean;
  error?: string;
};

const USERNAME_CONSTS = {
  MIN_LENGTH: 3,
  MAX_LENGTH: 20,
  ALLOWED_CHARS: /^[a-zA-Z0-9_.]+$/,
  CONSECUTIVE_DOTS: /[.]{2,}/,
} as const;

export function validateUsername(username: string): ValidationResult {
  const username_trimmed = username.trim();

  if (!username) {
    return {
      isValid: false,
      error: "No username provided!",
    };
  }

  if (username_trimmed === "") {
    return {
      isValid: false,
      error: "Username cannot be empty!",
    };
  }

  if (username_trimmed.length < USERNAME_CONSTS.MIN_LENGTH || username_trimmed.length > USERNAME_CONSTS.MAX_LENGTH) {
    return {
      isValid: false,
      error: `Username must be between ${USERNAME_CONSTS.MIN_LENGTH} and ${USERNAME_CONSTS.MAX_LENGTH} characters long.`,
    };
  }
  if (!USERNAME_CONSTS.ALLOWED_CHARS.test(username_trimmed)) {
    return {
      isValid: false,
      error:
        "Username can only contain letters, numbers, dots and underscores.",
    };
  }

  const invalidChars = ['.','_'];

  if ( invalidChars.some(char => username_trimmed.startsWith(char) ||
    username_trimmed.endsWith(char))
    
  ) {
    return {
      isValid: false,
      error: "Username cannot start or end with dots or underscores",
    };
  }

  if (USERNAME_CONSTS.CONSECUTIVE_DOTS.test(username_trimmed)) {
    return {
      isValid: false,
      error: "Username cannot contain consecutive dots (.)",
    };
  }

  return { isValid: true };
}
