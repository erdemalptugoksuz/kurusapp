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

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Minimum password length
const MIN_PASSWORD_LENGTH = 6;
const MIN_NAME_LENGTH = 2;

/**
 * Hook for sign-in form validation
 */
export function useSignInValidation() {
  const [errors, setErrors] = useState<SignInErrors>({});

  const validate = useCallback((email: string, password: string): boolean => {
    const newErrors: SignInErrors = {};

    if (!email.trim()) {
      newErrors.email = "E-posta adresi gerekli";
    } else if (!EMAIL_REGEX.test(email)) {
      newErrors.email = "Geçerli bir e-posta adresi girin";
    }

    if (!password) {
      newErrors.password = "Şifre gerekli";
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      newErrors.password = `Şifre en az ${MIN_PASSWORD_LENGTH} karakter olmalı`;
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

      if (!email.trim()) {
        newErrors.email = "E-posta adresi gerekli";
      } else if (!EMAIL_REGEX.test(email)) {
        newErrors.email = "Geçerli bir e-posta adresi girin";
      }

      if (!password) {
        newErrors.password = "Şifre gerekli";
      } else if (password.length < MIN_PASSWORD_LENGTH) {
        newErrors.password = `Şifre en az ${MIN_PASSWORD_LENGTH} karakter olmalı`;
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
    if (!email.trim()) {
      setError("E-posta adresi gerekli");
      return false;
    }
    if (!EMAIL_REGEX.test(email)) {
      setError("Geçerli bir e-posta adresi girin");
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

      if (!password) {
        newErrors.password = "Yeni şifre gerekli";
      } else if (password.length < MIN_PASSWORD_LENGTH) {
        newErrors.password = `Şifre en az ${MIN_PASSWORD_LENGTH} karakter olmalı`;
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

