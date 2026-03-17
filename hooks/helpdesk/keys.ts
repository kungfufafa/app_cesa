export const helpdeskKeys = {
  all: ["helpdesk"] as const,
  meta: (unitId?: number) => [...helpdeskKeys.all, "meta", unitId ?? "all"] as const,
  lists: () => [...helpdeskKeys.all, "lists"] as const,
  list: (params: Record<string, unknown>) => [...helpdeskKeys.lists(), params] as const,
  details: () => [...helpdeskKeys.all, "details"] as const,
  detail: (ticketId: number | string) => [...helpdeskKeys.details(), String(ticketId)] as const,
};
