import { useState, useCallback } from "react";

// Validation error types
export interface SignInErrors {
  email?: string;
  password?: string;
}

export interface SignUpErrors {
  fullName?: string;
  email?: string;
  password?: string;
  terms?: string;
}

export interface ResetPasswordErrors {
  password?: string;
  confirmPassword?: string;
}

// Email validation regex - RFC 5322 compliant pattern
// Validates: local-part@domain with proper structure
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// Minimum password length - 8 characters per modern security standards (NIST SP 800-63B)
const MIN_PASSWORD_LENGTH = 8;
const MIN_NAME_LENGTH = 2;

/**
 * Validates password against minimum requirements
 * @param password - The password to validate
 * @returns Error message if invalid, undefined if valid
 */
const validatePassword = (password: string): string | undefined => {
  if (!password) {
    return "Şifre gerekli";
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Şifre en az ${MIN_PASSWORD_LENGTH} karakter olmalı`;
  }
  return undefined;
};

/**
 * Validates email address format
 * @param email - The email to validate
 * @returns Error message if invalid, undefined if valid
 */
const validateEmail = (email: string): string | undefined => {
  if (!email.trim()) {
    return "E-posta adresi gerekli";
  }
  if (!EMAIL_REGEX.test(email)) {
    return "Geçerli bir e-posta adresi girin";
  }
  return undefined;
};

/**
 * Hook for sign-in form validation
 */
export function useSignInValidation() {
  const [errors, setErrors] = useState<SignInErrors>({});

  const validate = useCallback((email: string, password: string): boolean => {
    const newErrors: SignInErrors = {};

    const emailError = validateEmail(email);
    if (emailError) {
      newErrors.email = emailError;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return { errors, validate, clearErrors };
}

/**
 * Hook for sign-up form validation
 */
export function useSignUpValidation() {
  const [errors, setErrors] = useState<SignUpErrors>({});

  const validate = useCallback(
    (
      fullName: string,
      email: string,
      password: string,
      acceptedTerms: boolean
    ): boolean => {
      const newErrors: SignUpErrors = {};

      if (!fullName.trim()) {
        newErrors.fullName = "Ad soyad gerekli";
      } else if (fullName.trim().length < MIN_NAME_LENGTH) {
        newErrors.fullName = `Ad soyad en az ${MIN_NAME_LENGTH} karakter olmalı`;
      }

      const emailError = validateEmail(email);
      if (emailError) {
        newErrors.email = emailError;
      }

      const passwordError = validatePassword(password);
      if (passwordError) {
        newErrors.password = passwordError;
      }

      if (!acceptedTerms) {
        newErrors.terms = "Kullanım koşullarını kabul etmelisiniz";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    []
  );

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return { errors, validate, clearErrors };
}

/**
 * Hook for email validation (forgot password)
 */
export function useEmailValidation() {
  const [error, setError] = useState<string>("");

  const validate = useCallback((email: string): boolean => {
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return false;
    }
    setError("");
    return true;
  }, []);

  const clearError = useCallback(() => {
    setError("");
  }, []);

  return { error, validate, clearError };
}

/**
 * Hook for reset password form validation
 */
export function useResetPasswordValidation() {
  const [errors, setErrors] = useState<ResetPasswordErrors>({});

  const validate = useCallback(
    (password: string, confirmPassword: string): boolean => {
      const newErrors: ResetPasswordErrors = {};

      const passwordError = validatePassword(password);
      if (passwordError) {
        newErrors.password = passwordError;
      }

      if (!confirmPassword) {
        newErrors.confirmPassword = "Şifre tekrarı gerekli";
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = "Şifreler eşleşmiyor";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    []
  );

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return { errors, validate, clearErrors };
}
