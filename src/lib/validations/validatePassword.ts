export type PasswordValidationResult = {
  isValid: boolean;
  error?: string;
};

export function validatePassword(password: string): PasswordValidationResult {
  if (!password || password.trim() === "") {
    return { isValid: false, error: "Password cannot be empty." };
  }

  if (password.length < 8) {
    return { isValid: false, error: "Password must be at least 8 characters long." };
  }

  // Disallow spaces
  if (/\s/.test(password)) {
    return { isValid: false, error: "Password cannot contain spaces." };
  }

  // Require upper, lower, digit and symbol
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSymbol = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password);

  if (!hasUpper || !hasLower || !hasDigit || !hasSymbol) {
    return {
      isValid: false,
      error:
        "Password must include uppercase, lowercase, a number and a symbol.",
    };
  }

  // Basic check for malicious patterns or control characters
  if (/[<>"'`;\\(){}\[\]]/.test(password)) {
    return { isValid: false, error: "Password contains invalid characters." };
  }

  return { isValid: true };
}
