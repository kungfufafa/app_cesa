/**
 * Status types for requests (leave, overtime, etc.)
 */
export type RequestStatus = "approved" | "rejected" | "pending";

/**
 * Status badge styling configuration
 */
export interface StatusBadgeStyles {
  container: string;
  text: string;
}

/**
 * Returns Tailwind classes for status badge based on status
 * @param status - The status string
 * @returns Object with container and text class names
 */
export function getStatusBadgeClasses(
  status: string | RequestStatus
): StatusBadgeStyles {
  const normalizedStatus = status.toLowerCase() as RequestStatus;

  switch (normalizedStatus) {
    case "approved":
      return {
        container: "bg-emerald-100",
        text: "text-emerald-700",
      };
    case "rejected":
      return {
        container: "bg-red-100",
        text: "text-red-700",
      };
    case "pending":
    default:
      return {
        container: "bg-secondary",
        text: "text-muted-foreground",
      };
  }
}

/**
 * Returns Indonesian label for status
 * @param status - The status string
 * @returns Indonesian status label
 */
export function getStatusLabel(status: string | RequestStatus): string {
  const normalizedStatus = status.toLowerCase() as RequestStatus;

  switch (normalizedStatus) {
    case "approved":
      return "Disetujui";
    case "rejected":
      return "Ditolak";
    case "pending":
    default:
      return "Menunggu";
  }
}

/**
 * Presensi status types
 */
export type PresensiStatus =
  | "hadir"
  | "terlambat"
  | "pulang_cepat"
  | "izin"
  | "cuti"
  | "sakit"
  | "alpha";

/**
 * Returns Tailwind classes for presensi status badge
 * @param status - The presensi status
 * @returns Object with container and text class names
 */
export function getPresensiStatusClasses(
  status: PresensiStatus
): StatusBadgeStyles {
  switch (status) {
    case "hadir":
      return {
        container: "bg-emerald-100",
        text: "text-emerald-700",
      };
    case "terlambat":
    case "pulang_cepat":
      return {
        container: "bg-yellow-100",
        text: "text-yellow-700",
      };
    case "izin":
    case "cuti":
      return {
        container: "bg-blue-100",
        text: "text-blue-700",
      };
    case "sakit":
      return {
        container: "bg-purple-100",
        text: "text-purple-700",
      };
    case "alpha":
      return {
        container: "bg-red-100",
        text: "text-red-700",
      };
    default:
      return {
        container: "bg-secondary",
        text: "text-muted-foreground",
      };
  }
}

/**
 * Returns Indonesian label for presensi status
 * @param status - The presensi status
 * @returns Indonesian presensi status label
 */
export function getPresensiStatusLabel(
  status: PresensiStatus
): string {
  switch (status) {
    case "hadir":
      return "Hadir";
    case "terlambat":
      return "Terlambat";
    case "pulang_cepat":
      return "Pulang Cepat";
    case "izin":
      return "Izin";
    case "cuti":
      return "Cuti";
    case "sakit":
      return "Sakit";
    case "alpha":
      return "Alpha";
    default:
      return status;
  }
}
