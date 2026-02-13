import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

/**
 * Centralized dayjs configuration
 * Call this once at app startup to avoid repeating locale setup
 */

// Set locale to Indonesian
dayjs.locale("id");

// Extend with plugins
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

// Set default timezone (adjust based on your server location)
dayjs.tz.setDefault("Asia/Jakarta");

export default dayjs;

/**
 * Format date for display (e.g., "15 Jan 2024")
 */
export function formatDate(date: string | Date): string {
  return dayjs(date).format("DD MMM YYYY");
}

/**
 * Format date with time (e.g., "15 Jan 2024, 14:30")
 */
export function formatDateTime(date: string | Date): string {
  return dayjs(date).format("DD MMM YYYY, HH:mm");
}

/**
 * Format time only (e.g., "14:30")
 */
export function formatTime(date: string | Date): string {
  return dayjs(date).format("HH:mm");
}

/**
 * Format time string (HH:mm:ss) to HH:mm
 */
export function formatTimeString(value: string | null | undefined): string {
  if (!value) return "--:--";
  return value.slice(0, 5);
}

/**
 * Format for API requests (ISO string)
 */
export function formatForApi(date: Date | string): string {
  return dayjs(date).toISOString();
}

/**
 * Get relative time (e.g., "2 jam yang lalu")
 */
export function getRelativeTime(date: string | Date): string {
  return dayjs(date).fromNow();
}

/**
 * Check if date is today
 */
export function isToday(date: string | Date): boolean {
  return dayjs(date).isSame(dayjs(), "day");
}

/**
 * Check if date is in the past
 */
export function isPast(date: string | Date): boolean {
  return dayjs(date).isBefore(dayjs());
}

/**
 * Check if date is in the future
 */
export function isFuture(date: string | Date): boolean {
  return dayjs(date).isAfter(dayjs());
}
