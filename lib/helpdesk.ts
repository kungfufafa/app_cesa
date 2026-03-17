import type { HelpdeskAbilities, HelpdeskComment, HelpdeskTicketDetail } from "@/services/helpdesk";

export const HELPDESK_STATUS = {
  OPEN: 1,
  IN_PROGRESS: 2,
  CANCELLED: 3,
  CLOSED: 4,
} as const;

export type HelpdeskStatusId = (typeof HELPDESK_STATUS)[keyof typeof HELPDESK_STATUS];

export type HelpdeskStatusAction = "start_progress" | "cancel" | "close" | "reopen";

export function getHelpdeskStatusLabel(statusId?: number | null, fallback?: string | null) {
  switch (statusId) {
    case HELPDESK_STATUS.OPEN:
      return "Open";
    case HELPDESK_STATUS.IN_PROGRESS:
      return "In Progress";
    case HELPDESK_STATUS.CANCELLED:
      return "Cancelled";
    case HELPDESK_STATUS.CLOSED:
      return "Closed";
    default:
      return fallback || "Unknown";
  }
}

export function getHelpdeskStatusBadgeClasses(statusId?: number | null) {
  switch (statusId) {
    case HELPDESK_STATUS.OPEN:
      return {
        container: "bg-sky-100 border-sky-200",
        text: "text-sky-700",
      };
    case HELPDESK_STATUS.IN_PROGRESS:
      return {
        container: "bg-amber-100 border-amber-200",
        text: "text-amber-700",
      };
    case HELPDESK_STATUS.CANCELLED:
      return {
        container: "bg-rose-100 border-rose-200",
        text: "text-rose-700",
      };
    case HELPDESK_STATUS.CLOSED:
      return {
        container: "bg-emerald-100 border-emerald-200",
        text: "text-emerald-700",
      };
    default:
      return {
        container: "bg-secondary border-border",
        text: "text-muted-foreground",
      };
  }
}

export function getHelpdeskPriorityBadgeClasses(priorityName?: string | null) {
  const normalized = priorityName?.toLowerCase().trim() || "";

  if (normalized.includes("critical") || normalized.includes("urgent")) {
    return {
      container: "bg-rose-100 border-rose-200",
      text: "text-rose-700",
    };
  }

  if (normalized.includes("high")) {
    return {
      container: "bg-orange-100 border-orange-200",
      text: "text-orange-700",
    };
  }

  if (normalized.includes("medium")) {
    return {
      container: "bg-amber-100 border-amber-200",
      text: "text-amber-700",
    };
  }

  return {
    container: "bg-slate-100 border-slate-200",
    text: "text-slate-700",
  };
}

export function getVisibleHelpdeskComments(
  comments: HelpdeskComment[],
  abilities?: Partial<HelpdeskAbilities>
) {
  if (abilities?.add_internal_note) {
    return comments;
  }

  return comments.filter((comment) => comment.visibility !== "internal");
}

export function getAvailableHelpdeskActions(ticket: HelpdeskTicketDetail) {
  const actions: HelpdeskStatusAction[] = [];

  if (
    ticket.abilities.change_status &&
    ticket.ticket_status_id === HELPDESK_STATUS.OPEN
  ) {
    actions.push("start_progress");
  }

  if (ticket.abilities.cancel) {
    actions.push("cancel");
  }

  if (ticket.abilities.close) {
    actions.push("close");
  }

  if (ticket.abilities.reopen) {
    actions.push("reopen");
  }

  return actions;
}

export function getHelpdeskActionLabel(action: HelpdeskStatusAction) {
  switch (action) {
    case "start_progress":
      return "Mulai Proses";
    case "cancel":
      return "Batalkan";
    case "close":
      return "Tutup Tiket";
    case "reopen":
      return "Buka Kembali";
  }
}

export function getHelpdeskActionReasonLabel(action: HelpdeskStatusAction) {
  switch (action) {
    case "cancel":
      return "Alasan pembatalan";
    case "close":
      return "Alasan penutupan";
    case "reopen":
      return "Alasan buka kembali";
    case "start_progress":
      return "";
  }
}

export function getHelpdeskActionReasonPlaceholder(action: HelpdeskStatusAction) {
  switch (action) {
    case "cancel":
      return "Contoh: Tiket duplikat.";
    case "close":
      return "Contoh: Perbaikan sudah selesai.";
    case "reopen":
      return "Contoh: Masalah muncul lagi.";
    case "start_progress":
      return "";
  }
}
