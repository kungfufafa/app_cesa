import {
  getAvailableHelpdeskActions,
  getVisibleHelpdeskComments,
  HELPDESK_STATUS,
} from "@/lib/helpdesk";

describe("helpdesk helpers", () => {
  it("hides internal comments for users without internal note access", () => {
    const comments = [
      {
        id: 1,
        ticket_id: 10,
        comment: "Public update",
        visibility: "public" as const,
        attachments: [],
        user: {
          id: 1,
          name: "User",
          email: "user@example.com",
          avatar_url: null,
        },
        created_at: "2026-03-17T10:00:00+00:00",
        updated_at: "2026-03-17T10:00:00+00:00",
      },
      {
        id: 2,
        ticket_id: 10,
        comment: "Internal note",
        visibility: "internal" as const,
        attachments: [],
        user: {
          id: 2,
          name: "Agent",
          email: "agent@example.com",
          avatar_url: null,
        },
        created_at: "2026-03-17T10:10:00+00:00",
        updated_at: "2026-03-17T10:10:00+00:00",
      },
    ];

    expect(
      getVisibleHelpdeskComments(comments, {
        add_internal_note: false,
      })
    ).toHaveLength(1);

    expect(
      getVisibleHelpdeskComments(comments, {
        add_internal_note: true,
      })
    ).toHaveLength(2);
  });

  it("returns ability-driven actions without inferring roles", () => {
    expect(
      getAvailableHelpdeskActions({
        id: 1,
        title: "Printer offline",
        description: "Issue",
        priority_id: 1,
        unit_id: 2,
        owner_id: 3,
        problem_category_id: 4,
        company_id: 5,
        ticket_status_id: HELPDESK_STATUS.OPEN,
        responsible_id: 8,
        approved_at: null,
        solved_at: null,
        close_reason: null,
        cancel_reason: null,
        reopen_reason: null,
        attachments: [],
        comments: [],
        histories: [],
        abilities: {
          view: true,
          update: true,
          delete: false,
          comment: true,
          change_status: true,
          assign_responsible: true,
          cancel: true,
          close: false,
          reopen: false,
          add_internal_note: true,
        },
        created_at: "2026-03-17T10:00:00+00:00",
        updated_at: "2026-03-17T10:00:00+00:00",
      })
    ).toEqual(["start_progress", "cancel"]);

    expect(
      getAvailableHelpdeskActions({
        id: 2,
        title: "Done",
        description: "Issue",
        priority_id: 1,
        unit_id: 2,
        owner_id: 3,
        problem_category_id: 4,
        company_id: 5,
        ticket_status_id: HELPDESK_STATUS.CLOSED,
        responsible_id: 8,
        approved_at: null,
        solved_at: "2026-03-17T12:00:00+00:00",
        close_reason: "Done",
        cancel_reason: null,
        reopen_reason: null,
        attachments: [],
        comments: [],
        histories: [],
        abilities: {
          view: true,
          update: false,
          delete: false,
          comment: false,
          change_status: false,
          assign_responsible: false,
          cancel: false,
          close: false,
          reopen: true,
          add_internal_note: false,
        },
        created_at: "2026-03-17T10:00:00+00:00",
        updated_at: "2026-03-17T12:00:00+00:00",
      })
    ).toEqual(["reopen"]);
  });
});
