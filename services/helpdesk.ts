import api from "@/services/api";
import { parseApiPayload } from "@/services/api-response";
import { z } from "zod";

const integerSchema = z.coerce.number().int();
const nullableIntegerSchema = z.union([integerSchema, z.null()]).optional();
const nullableStringSchema = z.string().nullable().optional();

const helpdeskAttachmentSchema = z.object({
  name: z.string().min(1),
  path: z.string().min(1),
  url: z.string().min(1).optional().nullable(),
});

const helpdeskUserSchema = z.object({
  id: integerSchema,
  name: z.string().min(1),
  email: z.string().email(),
  avatar_url: z.string().min(1).nullable().optional(),
});

const helpdeskNamedOptionSchema = z.object({
  id: integerSchema,
  name: z.string().min(1),
});

const helpdeskProblemCategorySchema = helpdeskNamedOptionSchema.extend({
  unit_id: integerSchema,
  default_responsible_id: nullableIntegerSchema,
});

const helpdeskBoxSchema = z.object({
  key: z.enum(["incoming", "outgoing", "all"]),
  label: z.string().min(1),
});

const helpdeskAbilitiesSchema = z.object({
  view: z.boolean().default(false),
  update: z.boolean().default(false),
  delete: z.boolean().default(false),
  comment: z.boolean().default(false),
  change_status: z.boolean().default(false),
  assign_responsible: z.boolean().default(false),
  cancel: z.boolean().default(false),
  close: z.boolean().default(false),
  reopen: z.boolean().default(false),
  add_internal_note: z.boolean().default(false),
});

const helpdeskCommentSchema = z.object({
  id: integerSchema,
  ticket_id: integerSchema,
  comment: z.string().min(1),
  visibility: z.enum(["public", "internal"]).default("public"),
  attachments: z.array(helpdeskAttachmentSchema).default([]),
  user: helpdeskUserSchema,
  created_at: z.string().min(1),
  updated_at: z.string().min(1),
});

const helpdeskHistorySchema = z.object({
  id: integerSchema,
  ticket_id: integerSchema,
  ticket_status: helpdeskNamedOptionSchema,
  user: helpdeskUserSchema,
  created_at: z.string().min(1),
  updated_at: z.string().min(1),
});

const helpdeskTicketSummarySchema = z
  .object({
    id: integerSchema,
    title: z.string().min(1),
    description: nullableStringSchema.default(null),
    priority_id: nullableIntegerSchema.default(null),
    unit_id: nullableIntegerSchema.default(null),
    owner_id: nullableIntegerSchema.default(null),
    problem_category_id: nullableIntegerSchema.default(null),
    company_id: nullableIntegerSchema.default(null),
    ticket_status_id: nullableIntegerSchema.default(null),
    responsible_id: nullableIntegerSchema.default(null),
    approved_at: nullableStringSchema.default(null),
    solved_at: nullableStringSchema.default(null),
    close_reason: nullableStringSchema.default(null),
    cancel_reason: nullableStringSchema.default(null),
    reopen_reason: nullableStringSchema.default(null),
    attachments: z.array(helpdeskAttachmentSchema).default([]),
    priority: helpdeskNamedOptionSchema.nullable().optional(),
    unit: helpdeskNamedOptionSchema.nullable().optional(),
    problem_category: helpdeskNamedOptionSchema.nullable().optional(),
    company: helpdeskNamedOptionSchema.nullable().optional(),
    ticket_status: helpdeskNamedOptionSchema.nullable().optional(),
    owner: helpdeskUserSchema.nullable().optional(),
    responsible: helpdeskUserSchema.nullable().optional(),
    abilities: helpdeskAbilitiesSchema.optional(),
    created_at: z.string().min(1),
    updated_at: z.string().min(1),
  })
  .passthrough();

const helpdeskTicketDetailSchema = helpdeskTicketSummarySchema.extend({
  comments: z.array(helpdeskCommentSchema).default([]),
  histories: z.array(helpdeskHistorySchema).default([]),
  abilities: helpdeskAbilitiesSchema,
});

const helpdeskMetaSchema = z.object({
  boxes: z.array(helpdeskBoxSchema).default([]),
  priorities: z.array(helpdeskNamedOptionSchema).default([]),
  statuses: z.array(helpdeskNamedOptionSchema).default([]),
  units: z.array(helpdeskNamedOptionSchema).default([]),
  problem_categories: z.array(helpdeskProblemCategorySchema).default([]),
  responsible_users: z.array(helpdeskNamedOptionSchema).default([]),
  companies: z.array(helpdeskNamedOptionSchema).default([]),
  default_company_id: nullableIntegerSchema.default(null),
});

const helpdeskMetaResponseSchema = z.object({
  message: z.string().optional(),
  data: helpdeskMetaSchema,
});

const helpdeskListResponseSchema = z.object({
  data: z.array(helpdeskTicketSummarySchema),
  meta: z
    .object({
      current_page: integerSchema.default(1),
      last_page: integerSchema.default(1),
      per_page: integerSchema.default(20),
      total: integerSchema.default(0),
      box: z.enum(["incoming", "outgoing", "all"]).optional(),
      counts: z
        .object({
          incoming: integerSchema.default(0),
          outgoing: integerSchema.default(0),
          all: integerSchema.default(0),
        })
        .partial()
        .default({}),
    })
    .passthrough(),
  links: z
    .object({
      first: z.string().nullable().optional(),
      last: z.string().nullable().optional(),
      prev: z.string().nullable().optional(),
      next: z.string().nullable().optional(),
    })
    .partial()
    .default({}),
});

const helpdeskTicketWrappedResponseSchema = z.object({
  data: helpdeskTicketDetailSchema,
});

const helpdeskTicketResponseSchema = z.union([
  helpdeskTicketWrappedResponseSchema,
  helpdeskTicketDetailSchema,
]);

const helpdeskDeleteResponseSchema = z.object({
  message: z.string().min(1),
});

export type HelpdeskAttachment = z.infer<typeof helpdeskAttachmentSchema>;
export type HelpdeskUserSummary = z.infer<typeof helpdeskUserSchema>;
export type HelpdeskNamedOption = z.infer<typeof helpdeskNamedOptionSchema>;
export type HelpdeskProblemCategory = z.infer<typeof helpdeskProblemCategorySchema>;
export type HelpdeskBox = z.infer<typeof helpdeskBoxSchema>;
export type HelpdeskAbilities = z.infer<typeof helpdeskAbilitiesSchema>;
export type HelpdeskComment = z.infer<typeof helpdeskCommentSchema>;
export type HelpdeskHistory = z.infer<typeof helpdeskHistorySchema>;
export type HelpdeskTicketSummary = z.infer<typeof helpdeskTicketSummarySchema>;
export type HelpdeskTicketDetail = z.infer<typeof helpdeskTicketDetailSchema>;
export type HelpdeskMeta = z.infer<typeof helpdeskMetaSchema>;
export type HelpdeskListResponse = z.infer<typeof helpdeskListResponseSchema>;
export type HelpdeskBoxKey = HelpdeskBox["key"];
export type HelpdeskCommentVisibility = HelpdeskComment["visibility"];

export type HelpdeskFileUpload = {
  uri: string;
  name: string;
  mimeType: string;
};

export type HelpdeskListParams = {
  box?: HelpdeskBoxKey;
  search?: string;
  priority_id?: number;
  ticket_status_id?: number;
  unit_id?: number;
  problem_category_id?: number;
  responsible_id?: number;
  per_page?: number;
  page?: number;
};

export type CreateHelpdeskTicketInput = {
  priority_id: number;
  unit_id: number;
  problem_category_id: number;
  company_id?: number | null;
  title: string;
  description: string;
  supporting_attachments?: HelpdeskFileUpload[];
};

export type UpdateHelpdeskTicketInput = {
  priority_id?: number;
  unit_id?: number;
  problem_category_id?: number;
  company_id?: number | null;
  title?: string;
  description?: string;
  responsible_id?: number | null;
  existing_supporting_attachments?: string[];
  supporting_attachments?: HelpdeskFileUpload[];
};

export type ChangeHelpdeskStatusInput = {
  ticket_status_id: 1 | 2 | 3 | 4;
  close_reason?: string;
  cancel_reason?: string;
  reopen_reason?: string;
};

export type CreateHelpdeskCommentInput = {
  comment: string;
  visibility?: HelpdeskCommentVisibility;
  attachments?: HelpdeskFileUpload[];
};

const MULTIPART_HEADERS = {
  "Content-Type": "multipart/form-data",
} as const;

const appendFileArray = (
  formData: FormData,
  fieldName: string,
  files: HelpdeskFileUpload[] | undefined
) => {
  files?.forEach((file) => {
    formData.append(fieldName, {
      uri: file.uri,
      name: file.name,
      type: file.mimeType,
    } as unknown as Blob);
  });
};

const appendStringArray = (formData: FormData, fieldName: string, values: string[] | undefined) => {
  values?.forEach((value) => {
    formData.append(fieldName, value);
  });
};

const appendNullableScalar = (
  formData: FormData,
  key: string,
  value: string | number | null | undefined
) => {
  if (value === undefined) return;
  formData.append(key, value === null ? "" : String(value));
};

export const buildHelpdeskListQueryParams = (params: HelpdeskListParams = {}) => {
  const queryParams: Record<string, string | number> = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    queryParams[key] = value;
  });

  return queryParams;
};

const buildTicketJsonPayload = (
  input: CreateHelpdeskTicketInput | UpdateHelpdeskTicketInput | ChangeHelpdeskStatusInput
) => {
  const payload: Record<string, string | number | null | string[]> = {};

  Object.entries(input).forEach(([key, value]) => {
    if (value === undefined) return;
    if (Array.isArray(value)) {
      if (value.every((item) => typeof item === "string")) {
        payload[key] = value;
      }
      return;
    }
    payload[key] = value as string | number | null;
  });

  return payload;
};

export const buildHelpdeskTicketFormData = (
  input: CreateHelpdeskTicketInput | UpdateHelpdeskTicketInput | ChangeHelpdeskStatusInput
) => {
  const formData = new FormData();

  appendNullableScalar(formData, "priority_id", "priority_id" in input ? input.priority_id : undefined);
  appendNullableScalar(formData, "unit_id", "unit_id" in input ? input.unit_id : undefined);
  appendNullableScalar(
    formData,
    "problem_category_id",
    "problem_category_id" in input ? input.problem_category_id : undefined
  );
  appendNullableScalar(formData, "company_id", "company_id" in input ? input.company_id : undefined);
  appendNullableScalar(formData, "title", "title" in input ? input.title : undefined);
  appendNullableScalar(
    formData,
    "description",
    "description" in input ? input.description : undefined
  );
  appendNullableScalar(
    formData,
    "responsible_id",
    "responsible_id" in input ? input.responsible_id : undefined
  );
  appendNullableScalar(
    formData,
    "ticket_status_id",
    "ticket_status_id" in input ? input.ticket_status_id : undefined
  );
  appendNullableScalar(
    formData,
    "close_reason",
    "close_reason" in input ? input.close_reason : undefined
  );
  appendNullableScalar(
    formData,
    "cancel_reason",
    "cancel_reason" in input ? input.cancel_reason : undefined
  );
  appendNullableScalar(
    formData,
    "reopen_reason",
    "reopen_reason" in input ? input.reopen_reason : undefined
  );

  if ("existing_supporting_attachments" in input) {
    appendStringArray(
      formData,
      "existing_supporting_attachments[]",
      input.existing_supporting_attachments
    );
  }

  if ("supporting_attachments" in input) {
    appendFileArray(formData, "supporting_attachments[]", input.supporting_attachments);
  }

  return formData;
};

export const buildHelpdeskCommentFormData = (input: CreateHelpdeskCommentInput) => {
  const formData = new FormData();
  formData.append("comment", input.comment);

  if (input.visibility) {
    formData.append("visibility", input.visibility);
  }

  appendFileArray(formData, "attachments[]", input.attachments);
  return formData;
};

export const getHelpdeskMeta = async (unitId?: number): Promise<HelpdeskMeta> => {
  const response = await api.get("/admin/api/v1/helpdesk/meta", {
    params: unitId ? { unit_id: unitId } : undefined,
  });
  const payload = parseApiPayload(
    helpdeskMetaResponseSchema,
    response.data,
    "Metadata helpdesk tidak valid."
  );

  return payload.data;
};

export const getHelpdeskTickets = async (
  params: HelpdeskListParams = {}
): Promise<HelpdeskListResponse> => {
  const response = await api.get("/admin/api/v1/helpdesk/tickets", {
    params: buildHelpdeskListQueryParams(params),
  });

  return parseApiPayload(
    helpdeskListResponseSchema,
    response.data,
    "Daftar tiket helpdesk tidak valid."
  );
};

export const getHelpdeskTicket = async (ticketId: number | string): Promise<HelpdeskTicketDetail> => {
  const response = await api.get(`/admin/api/v1/helpdesk/tickets/${ticketId}`);
  const payload = parseApiPayload(
    helpdeskTicketResponseSchema,
    response.data,
    "Detail tiket helpdesk tidak valid."
  );

  return unwrapHelpdeskTicketResponse(payload);
};

const shouldUseMultipartForTicket = (
  input: CreateHelpdeskTicketInput | UpdateHelpdeskTicketInput | ChangeHelpdeskStatusInput
) =>
  ("supporting_attachments" in input && !!input.supporting_attachments?.length) ||
  "existing_supporting_attachments" in input;

const unwrapHelpdeskTicketResponse = (
  payload: z.infer<typeof helpdeskTicketResponseSchema>
): HelpdeskTicketDetail => {
  const wrappedPayload = helpdeskTicketWrappedResponseSchema.safeParse(payload);

  return wrappedPayload.success ? wrappedPayload.data.data : (payload as HelpdeskTicketDetail);
};

export const createHelpdeskTicket = async (
  input: CreateHelpdeskTicketInput
): Promise<HelpdeskTicketDetail> => {
  const response = shouldUseMultipartForTicket(input)
    ? await api.post("/admin/api/v1/helpdesk/tickets", buildHelpdeskTicketFormData(input), {
        headers: MULTIPART_HEADERS,
      })
    : await api.post("/admin/api/v1/helpdesk/tickets", buildTicketJsonPayload(input));

  const payload = parseApiPayload(
    helpdeskTicketResponseSchema,
    response.data,
    "Respons pembuatan tiket tidak valid."
  );

  return unwrapHelpdeskTicketResponse(payload);
};

export const updateHelpdeskTicket = async (
  ticketId: number | string,
  input: UpdateHelpdeskTicketInput | ChangeHelpdeskStatusInput
): Promise<HelpdeskTicketDetail> => {
  const response = shouldUseMultipartForTicket(input)
    ? await api.patch(
        `/admin/api/v1/helpdesk/tickets/${ticketId}`,
        buildHelpdeskTicketFormData(input),
        {
          headers: MULTIPART_HEADERS,
        }
      )
    : await api.patch(
        `/admin/api/v1/helpdesk/tickets/${ticketId}`,
        buildTicketJsonPayload(input)
      );

  const payload = parseApiPayload(
    helpdeskTicketResponseSchema,
    response.data,
    "Respons update tiket tidak valid."
  );

  return unwrapHelpdeskTicketResponse(payload);
};

export const addHelpdeskComment = async (
  ticketId: number | string,
  input: CreateHelpdeskCommentInput
): Promise<HelpdeskTicketDetail> => {
  const response = input.attachments?.length
    ? await api.post(
        `/admin/api/v1/helpdesk/tickets/${ticketId}/comments`,
        buildHelpdeskCommentFormData(input),
        {
          headers: MULTIPART_HEADERS,
        }
      )
    : await api.post(`/admin/api/v1/helpdesk/tickets/${ticketId}/comments`, {
        comment: input.comment,
        visibility: input.visibility,
      });

  const payload = parseApiPayload(
    helpdeskTicketResponseSchema,
    response.data,
    "Respons komentar tiket tidak valid."
  );

  return unwrapHelpdeskTicketResponse(payload);
};

export const deleteHelpdeskTicket = async (ticketId: number | string): Promise<string> => {
  const response = await api.delete(`/admin/api/v1/helpdesk/tickets/${ticketId}`);
  const payload = parseApiPayload(
    helpdeskDeleteResponseSchema,
    response.data,
    "Respons hapus tiket tidak valid."
  );

  return payload.message;
};
