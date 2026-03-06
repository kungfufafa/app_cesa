/**
 * Standardized error handling hook for API errors
 * Provides consistent error display across the application
 */
import { useCallback } from "react";
import { Alert } from "react-native";
import { normalizeApiError } from "@/lib/api-errors";

export interface UseApiErrorResult {
  /** Display error alert with normalized message */
  showError: (error: unknown, title?: string) => void;
  /** Get normalized error message without displaying */
  getErrorMessage: (error: unknown) => string;
}

/**
 * Hook for standardized API error handling
 * @returns Error display utilities
 */
export function useApiError(): UseApiErrorResult {
  const showError = useCallback((error: unknown, title = "Error") => {
    const message = normalizeApiError(error);
    Alert.alert(title, message);
  }, []);

  const getErrorMessage = useCallback((error: unknown): string => {
    return normalizeApiError(error);
  }, []);

  return {
    showError,
    getErrorMessage,
  };
}
