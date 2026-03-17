/**
 * Application configuration constants
 * Centralized config for easy maintenance and environment-based overrides
 */

/**
 * Support contact information
 */
export const SUPPORT_CONTACT = {
  /** WhatsApp number (without + or spaces) */
  whatsapp: process.env.EXPO_PUBLIC_SUPPORT_WHATSAPP || "62895636786435",
  /** Email address */
  email: process.env.EXPO_PUBLIC_SUPPORT_EMAIL || "support@example.com",
} as const;

/**
 * API configuration
 */
export const API_CONFIG = {
  /** Request timeout in milliseconds */
  timeout: 30000, // 30 seconds
  /** Base URL from environment */
  baseUrl: process.env.EXPO_PUBLIC_API_URL || "",
} as const;
