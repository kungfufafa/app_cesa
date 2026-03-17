import api from '@/services/api';
import { parseApiEnvelope, parseApiResult } from '@/services/api-response';
import { z } from "zod";

const nullableStringSchema = z.string().nullable();
const attachmentSchema = z.object({
  uri: z.string().min(1),
  name: z.string().min(1),
  mimeType: z.string().min(1),
});

const leaveItemSchema = z.object({
  id: z.coerce.number().int(),
  type: z.string().min(1),
  start_date: nullableStringSchema,
  end_date: nullableStringSchema,
  reason: z.string().min(1),
  status: z.string().min(1),
  note: nullableStringSchema.optional(),
  attachment: nullableStringSchema.optional(),
});

const overtimeItemSchema = z.object({
  id: z.coerce.number().int(),
  date: z.string().min(1),
  start_time: nullableStringSchema,
  end_time: nullableStringSchema,
  reason: z.string().min(1),
  status: z.string().min(1),
  note: nullableStringSchema.optional(),
  attachment: nullableStringSchema.optional(),
});

export interface RequestAttachment {
  uri: string;
  name: string;
  mimeType: string;
}

export interface LeaveRequest {
  type: string;
  start_date: string;
  end_date: string;
  reason: string;
  file?: z.infer<typeof attachmentSchema> | null;
}

export type LeaveItem = z.infer<typeof leaveItemSchema>;

export interface OvertimeRequest {
  date: string;
  start_time: string;
  end_time: string;
  reason: string;
  file?: z.infer<typeof attachmentSchema> | null;
}

export type OvertimeItem = z.infer<typeof overtimeItemSchema>;

const MULTIPART_HEADERS = {
  'Content-Type': 'multipart/form-data',
} as const;

const appendAttachment = (
  formData: FormData,
  attachment: RequestAttachment | null | undefined
) => {
  if (!attachment) return;

  formData.append('file', {
    uri: attachment.uri,
    name: attachment.name,
    type: attachment.mimeType,
  } as unknown as Blob);
};

const postMultipartForm = async (
  url: string,
  fields: Record<string, string>,
  attachment?: RequestAttachment | null
) => {
  const formData = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    formData.append(key, value);
  });
  appendAttachment(formData, attachment);

  const response = await api.post(url, formData, {
    headers: MULTIPART_HEADERS,
  });
  return response.data;
};

export const submitLeave = async (data: LeaveRequest) => {
  const response = await postMultipartForm(
    '/api/leaves',
    {
      type: data.type,
      start_date: data.start_date,
      end_date: data.end_date,
      reason: data.reason,
    },
    data.file
  );
  return parseApiResult(response, 'Gagal mengirim pengajuan izin/cuti.');
};

export const submitOvertime = async (data: OvertimeRequest) => {
  const response = await postMultipartForm(
    '/api/overtimes',
    {
      date: data.date,
      start_time: data.start_time,
      end_time: data.end_time,
      reason: data.reason,
    },
    data.file
  );
  return parseApiResult(response, 'Gagal mengirim pengajuan lembur.');
};

export const getOvertimes = async (): Promise<OvertimeItem[]> => {
  const response = await api.get('/api/overtimes');
  return parseApiEnvelope(
    z.array(overtimeItemSchema),
    response.data,
    'Gagal memuat daftar lembur.'
  );
};

export const getLeaves = async (): Promise<LeaveItem[]> => {
  const response = await api.get('/api/leaves');
  return parseApiEnvelope(
    z.array(leaveItemSchema),
    response.data,
    'Gagal memuat daftar izin/cuti.'
  );
};
