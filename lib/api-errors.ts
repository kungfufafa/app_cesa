import { isAxiosError } from "axios";

/**
 * Normalizes API errors into user-friendly Indonesian error messages
 * @param error - The error to normalize
 * @param fallbackMessage - Custom fallback message (default: generic error message)
 * @returns User-friendly error message in Indonesian
 */
export function normalizeApiError(
  error: unknown,
  fallbackMessage: string = "Terjadi kesalahan. Silakan coba lagi."
): string {
  if (isAxiosError(error)) {
    const payload = error.response?.data as
      | {
          message?: string;
          errors?: Record<string, string[] | string>;
        }
      | undefined;

    // Handle validation errors (multiple error messages)
    if (payload?.errors) {
      const values = Object.values(payload.errors)
        .flatMap((value) => (Array.isArray(value) ? value : [value]))
        .filter(Boolean);

      if (values.length > 0) {
        return String(values[0]);
      }
    }

    // Handle single error message
    if (payload?.message) {
      return payload.message;
    }

    // Handle network errors
    if (error.code === "NETWORK_ERROR" || error.message === "Network Error") {
      return "Koneksi jaringan gagal. Periksa koneksi internet Anda.";
    }

    // Handle timeout
    if (error.code === "ECONNABORTED") {
      return "Permintaan timeout. Silakan coba lagi.";
    }
  }

  // Handle generic Error instances
  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}

/**
 * Error types for structured error handling
 */
export type ApiErrorType =
  | "validation"
  | "auth"
  | "network"
  | "server"
  | "rate_limit"
  | "unknown";

export interface ApiError extends Error {
  type: ApiErrorType;
  statusCode?: number;
}

/**
 * Creates a structured API error with type discrimination
 */
export function createApiError(
  error: unknown,
  type: ApiErrorType = "unknown",
  statusCode?: number
): ApiError {
  const message = normalizeApiError(error);
  const apiError = new Error(message) as ApiError;
  apiError.type = type;
  apiError.statusCode = statusCode;
  return apiError;
}
