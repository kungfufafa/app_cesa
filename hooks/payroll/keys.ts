/**
 * Query key factory for payroll-related queries
 * Follows the same pattern as presensiKeys for consistency
 */
export const payrollKeys = {
  all: ["payroll"] as const,
  lists: () => [...payrollKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...payrollKeys.lists(), filters] as const,
  details: () => [...payrollKeys.all, "detail"] as const,
  detail: (id: string) => [...payrollKeys.details(), id] as const,
};
