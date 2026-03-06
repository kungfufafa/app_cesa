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
  /** Number of retries for failed requests */
  maxRetries: 2,
  /** Base URL from environment */
  baseUrl: process.env.EXPO_PUBLIC_API_URL || "",
} as const;

/**
 * Feature flags for gradual rollout
 */
export const FEATURES = {
  /** Enable profile editing */
  EDIT_PROFILE: false,
  /** Enable settings screen */
  SETTINGS: false,
  /** Enable help & support section */
  HELP_SUPPORT: false,
  /** Enable face detection in camera */
  FACE_DETECTION: true,
} as const;

/**
 * Attendance configuration
 */
export const ATTENDANCE_CONFIG = {
  /** Default office radius in meters */
  defaultRadius: 100,
  /** Location accuracy for attendance */
  locationAccuracy: "high" as const,
  /** Maximum file size for attachments in bytes */
  maxAttachmentSize: 5 * 1024 * 1024, // 5MB
  /** Allowed file types for attachments */
  allowedAttachmentTypes: ["image/jpeg", "image/png", "application/pdf"],
} as const;

/**
 * Default map configuration
 */
export const MAP_CONFIG = {
  /** Default latitude (Jakarta) */
  defaultLatitude: -6.2,
  /** Default longitude (Jakarta) */
  defaultLongitude: 106.816666,
  /** Default zoom level */
  defaultZoom: 0.005,
} as const;
