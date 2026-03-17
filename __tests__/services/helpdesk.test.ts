jest.mock("@/services/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

import api from "@/services/api";
import {
  addHelpdeskComment,
  buildHelpdeskCommentFormData,
  buildHelpdeskListQueryParams,
  buildHelpdeskTicketFormData,
  createHelpdeskTicket,
  getHelpdeskTickets,
  updateHelpdeskTicket,
} from "@/services/helpdesk";

const mockApi = api as jest.Mocked<typeof api>;

class MockFormData {
  entries: Array<[string, unknown]> = [];

  append(key: string, value: unknown) {
    this.entries.push([key, value]);
  }
}

describe("helpdesk service", () => {
  const originalFormData = global.FormData;

  beforeEach(() => {
    jest.clearAllMocks();
    global.FormData = MockFormData as unknown as typeof FormData;
  });

  afterAll(() => {
    global.FormData = originalFormData;
  });

  it("builds list query params without empty values", () => {
    expect(
      buildHelpdeskListQueryParams({
        box: "incoming",
        search: "",
        priority_id: 2,
        unit_id: undefined,
        per_page: 20,
      })
    ).toEqual({
      box: "incoming",
      priority_id: 2,
      per_page: 20,
    });
  });

  it("builds multipart form data for ticket create/update", () => {
    const formData = buildHelpdeskTicketFormData({
      priority_id: 1,
      unit_id: 2,
      problem_category_id: 3,
      company_id: 4,
      title: "Printer offline",
      description: "Tidak bisa print.",
      responsible_id: 5,
      existing_supporting_attachments: ["helpdesk/tickets/existing.pdf"],
      supporting_attachments: [
        {
          uri: "file:///tmp/photo.jpg",
          name: "photo.jpg",
          mimeType: "image/jpeg",
        },
      ],
    });

    expect((formData as unknown as MockFormData).entries).toEqual([
      ["priority_id", "1"],
      ["unit_id", "2"],
      ["problem_category_id", "3"],
      ["company_id", "4"],
      ["title", "Printer offline"],
      ["description", "Tidak bisa print."],
      ["responsible_id", "5"],
      ["existing_supporting_attachments[]", "helpdesk/tickets/existing.pdf"],
      [
        "supporting_attachments[]",
        {
          uri: "file:///tmp/photo.jpg",
          name: "photo.jpg",
          type: "image/jpeg",
        },
      ],
    ]);
  });

  it("builds multipart form data for comments", () => {
    const formData = buildHelpdeskCommentFormData({
      comment: "Sedang ditangani.",
      visibility: "internal",
      attachments: [
        {
          uri: "file:///tmp/comment.pdf",
          name: "comment.pdf",
          mimeType: "application/pdf",
        },
      ],
    });

    expect((formData as unknown as MockFormData).entries).toEqual([
      ["comment", "Sedang ditangani."],
      ["visibility", "internal"],
      [
        "attachments[]",
        {
          uri: "file:///tmp/comment.pdf",
          name: "comment.pdf",
          type: "application/pdf",
        },
      ],
    ]);
  });

  it("requests helpdesk tickets with parsed params", async () => {
    mockApi.get.mockResolvedValue({
      data: {
        data: [],
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 20,
          total: 0,
          box: "incoming",
          counts: {
            incoming: 0,
            outgoing: 0,
            all: 0,
          },
        },
        links: {},
      },
    });

    const result = await getHelpdeskTickets({
      box: "incoming",
      priority_id: 1,
      per_page: 20,
    });

    expect(mockApi.get).toHaveBeenCalledWith("/admin/api/v1/helpdesk/tickets", {
      params: {
        box: "incoming",
        priority_id: 1,
        per_page: 20,
      },
    });
    expect(result.meta.box).toBe("incoming");
  });

  it("creates ticket with json when no attachment is present", async () => {
    mockApi.post.mockResolvedValue({
      data: {
        data: {
          id: 12,
          title: "Printer offline",
          description: "Tidak bisa print.",
          priority_id: 1,
          unit_id: 2,
          owner_id: 3,
          problem_category_id: 4,
          company_id: 5,
          ticket_status_id: 1,
          responsible_id: null,
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
            assign_responsible: false,
            cancel: true,
            close: false,
            reopen: false,
            add_internal_note: false,
          },
          created_at: "2026-03-17T10:00:00+00:00",
          updated_at: "2026-03-17T10:00:00+00:00",
        },
      },
    });

    await createHelpdeskTicket({
      priority_id: 1,
      unit_id: 2,
      problem_category_id: 4,
      company_id: 5,
      title: "Printer offline",
      description: "Tidak bisa print.",
    });

    expect(mockApi.post).toHaveBeenCalledWith("/admin/api/v1/helpdesk/tickets", {
      priority_id: 1,
      unit_id: 2,
      problem_category_id: 4,
      company_id: 5,
      title: "Printer offline",
      description: "Tidak bisa print.",
    });
  });

  it("updates ticket with multipart when file is attached", async () => {
    mockApi.patch.mockResolvedValue({
      data: {
        data: {
          id: 99,
          title: "Updated",
          description: "Updated desc",
          priority_id: 1,
          unit_id: 2,
          owner_id: 3,
          problem_category_id: 4,
          company_id: 5,
          ticket_status_id: 2,
          responsible_id: 6,
          approved_at: "2026-03-17T10:00:00+00:00",
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
            close: true,
            reopen: false,
            add_internal_note: true,
          },
          created_at: "2026-03-17T10:00:00+00:00",
          updated_at: "2026-03-17T11:00:00+00:00",
        },
      },
    });

    await updateHelpdeskTicket(99, {
      title: "Updated",
      description: "Updated desc",
      existing_supporting_attachments: ["helpdesk/tickets/old.pdf"],
      supporting_attachments: [
        {
          uri: "file:///tmp/new.pdf",
          name: "new.pdf",
          mimeType: "application/pdf",
        },
      ],
    });

    expect(mockApi.patch).toHaveBeenCalledWith(
      "/admin/api/v1/helpdesk/tickets/99",
      expect.any(MockFormData),
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  });

  it("posts comment as multipart when attachment exists", async () => {
    mockApi.post.mockResolvedValue({
      data: {
        data: {
          id: 99,
          title: "Updated",
          description: "Updated desc",
          priority_id: 1,
          unit_id: 2,
          owner_id: 3,
          problem_category_id: 4,
          company_id: 5,
          ticket_status_id: 2,
          responsible_id: 6,
          approved_at: "2026-03-17T10:00:00+00:00",
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
            close: true,
            reopen: false,
            add_internal_note: true,
          },
          created_at: "2026-03-17T10:00:00+00:00",
          updated_at: "2026-03-17T11:00:00+00:00",
        },
      },
    });

    await addHelpdeskComment(99, {
      comment: "Investigasi sedang berjalan.",
      visibility: "internal",
      attachments: [
        {
          uri: "file:///tmp/investigation.pdf",
          name: "investigation.pdf",
          mimeType: "application/pdf",
        },
      ],
    });

    expect(mockApi.post).toHaveBeenCalledWith(
      "/admin/api/v1/helpdesk/tickets/99/comments",
      expect.any(MockFormData),
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  });
});
