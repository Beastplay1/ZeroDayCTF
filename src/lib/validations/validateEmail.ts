export type EmailValidationResult = {
  isValid: boolean;
  error?: string;
};

export function validateEmail(email: string): EmailValidationResult {
  if (!email || email.trim() === "") {
    return { isValid: false, error: "Email cannot be empty!" };
  }

  const escapeHtml = (str: string): string => {
    const htmlEscapeMap: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
    };
    return str.replace(/[&<>"'/]/g, (char) => htmlEscapeMap[char]);
  };

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: escapeHtml("Please enter a valid email address."),
    };
  }

  const dangerousChars = /[<>\"'`(){}[\]\\;:]/;
  if (dangerousChars.test(email)) {
    return {
      isValid: false,
      error: escapeHtml("Email contains invalid characters."),
    };
  }

  return { isValid: true };
}