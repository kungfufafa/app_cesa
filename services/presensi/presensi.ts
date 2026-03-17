import api from "@/services/api";
import dayjs from "@/lib/dates";
import { parseApiEnvelope, parseApiResult } from "@/services/api-response";
import { z } from "zod";

const nullableStringSchema = z.string().nullable();
const numberSchema = z.coerce.number();
const integerSchema = z.coerce.number().int();
const booleanishSchema = z
  .union([z.boolean(), z.number().int(), z.string()])
  .transform((value) => {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value === 1;

    const normalized = value.trim().toLowerCase();
    return normalized === "1" || normalized === "true" || normalized === "yes";
  });

const presensiTodayApiSchema = z.object({
  today: z
    .object({
      start_time: nullableStringSchema,
      end_time: nullableStringSchema,
    })
    .nullable(),
  this_month: z
    .array(
      z.object({
        start_time: nullableStringSchema,
        end_time: nullableStringSchema,
        date: z.string().min(1),
      })
    )
    .default([]),
});

const presensiHistoryRecordSchema = z.object({
  start_time: nullableStringSchema,
  end_time: nullableStringSchema,
  date: z.string().min(1),
});

const scheduleResponseSchema = z.object({
  id: integerSchema,
  is_wfa: booleanishSchema,
  is_banned: booleanishSchema,
  office: z.object({
    id: integerSchema,
    name: z.string().min(1),
    latitude: numberSchema,
    longitude: numberSchema,
    radius: numberSchema,
  }),
  shift: z.object({
    id: integerSchema,
    name: z.string().min(1),
    start_time: z.string().min(1),
    end_time: z.string().min(1),
  }),
});

export type PresensiHariIniResponse = {
  check_in_time: string | null;
  check_out_time: string | null;
  date: string;
  status: string; // 'present', 'absent', 'late', etc.
};

export type PresensiRecord = {
  id: number | string;
  date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  status: string;
  is_late: boolean;
};

export type PresensiSubmission = {
  photoUri: string;
  latitude: number;
  longitude: number;
  isMockLocation?: boolean;
};

export type ScheduleResponse = {
  id: number;
  is_wfa: boolean;
  is_banned: boolean;
  office: {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    radius: number;
  };
  shift: {
    id: number;
    name: string;
    start_time: string;
    end_time: string;
  };
};

export async function getPresensiHariIni(): Promise<PresensiHariIniResponse> {
  const response = await api.get("/api/get-attendance-today");
  const payload = parseApiEnvelope(
    presensiTodayApiSchema,
    response.data,
    "Gagal memuat data presensi."
  );

  const today = payload.today;
  const todayDate = dayjs().format("YYYY-MM-DD");

  return {
    check_in_time: today?.start_time ?? null,
    check_out_time: today?.end_time ?? null,
    date: todayDate,
    status: today ? "present" : "absent",
  };
}

export async function getRiwayatPresensi(
  month: number,
  year: number
): Promise<PresensiRecord[]> {
  const response = await api.get(
    `/api/get-attendance-by-month-year/${month}/${year}`
  );
  const records = parseApiEnvelope(
    z.array(presensiHistoryRecordSchema),
    response.data,
    "Gagal memuat riwayat presensi."
  );

  return records.map((record, index) => ({
    id: record.date || index,
    date: record.date,
    check_in_time: record.start_time ?? null,
    check_out_time: record.end_time ?? null,
    status: record.start_time ? "present" : "absent",
    is_late: false,
  }));
}

export type SubmitPresensiResponse = {
  success: boolean;
  message: string;
};

export async function submitPresensi(
  data: PresensiSubmission
): Promise<SubmitPresensiResponse> {
  const formData = new FormData();
  formData.append("latitude", String(data.latitude));
  formData.append("longitude", String(data.longitude));
  if (data.isMockLocation !== undefined) {
    formData.append("is_mock_location", data.isMockLocation ? "1" : "0");
  }

  const filename = data.photoUri.split("/").pop() || "photo.jpg";
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : `image/jpeg`;

  formData.append("photo", {
    uri: data.photoUri,
    name: filename,
    type,
  } as unknown as Blob);

  const response = await api.post("/api/store-attendance", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return parseApiResult(response.data, "Gagal mengirim presensi.");
}

export async function getSchedule(): Promise<ScheduleResponse> {
  const response = await api.get("/api/get-schedule");
  return parseApiEnvelope(
    scheduleResponseSchema.nullable().transform((value, ctx) => {
      if (!value) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Jadwal tidak tersedia.",
        });
        return z.NEVER;
      }

      return value;
    }),
    response.data,
    "Gagal memuat jadwal."
  );
}
