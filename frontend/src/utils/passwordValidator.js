/**
 * Validates password strength requirements
 * Requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one digit
 * - At least one special character (@$!%*?&)
 */
export const validatePasswordStrength = (password) => {
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasDigit: /\d/.test(password),
    hasSpecialChar: /[@$!%*?&]/.test(password),
  };

  const isValid = Object.values(requirements).every((req) => req);

  return {
    isValid,
    requirements,
    strength: getPasswordStrength(requirements),
    message: getPasswordMessage(requirements),
  };
};

/**
 * Calculate password strength level (0-5)
 */
export const getPasswordStrength = (requirements) => {
  const metRequirements = Object.values(requirements).filter(Boolean).length;
  return metRequirements;
};

/**
 * Get detailed error message for failed requirements
 */
export const getPasswordMessage = (requirements) => {
  const failures = [];

  if (!requirements.minLength) failures.push("At least 8 characters");
  if (!requirements.hasUppercase) failures.push("One uppercase letter");
  if (!requirements.hasLowercase) failures.push("One lowercase letter");
  if (!requirements.hasDigit) failures.push("One digit (0-9)");
  if (!requirements.hasSpecialChar) failures.push("One special character (@$!%*?&)");

  if (failures.length === 0) {
    return "Password meets all requirements!";
  }

  return `Password must contain: ${failures.join(", ")}`;
};
