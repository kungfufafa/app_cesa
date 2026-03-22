import api from "@/services/api";
import dayjs from "@/lib/dates";
import { parseApiEnvelope, parseApiResult } from "@/services/api-response";
import { z } from "zod";

const nullableStringSchema = z.string().nullable().optional();
const numberSchema = z.coerce.number();
const integerSchema = z.coerce.number().int();
const nullableNumberSchema = z.union([numberSchema, z.null()]).optional();
const nullableIntegerSchema = z.union([integerSchema, z.null()]).optional();
const booleanishSchema = z
  .union([z.boolean(), z.number().int(), z.string()])
  .transform((value: boolean | number | string) => {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value === 1;

    const normalized = value.trim().toLowerCase();
    return normalized === "1" || normalized === "true" || normalized === "yes";
  });

const attendanceScheduleSnapshotSchema = z
  .object({
    id: nullableIntegerSchema,
    start_time: nullableStringSchema,
    end_time: nullableStringSchema,
    latitude: nullableNumberSchema,
    longitude: nullableNumberSchema,
    office_name: nullableStringSchema,
    shift_name: nullableStringSchema,
    early_checkout_tolerance_minutes: nullableIntegerSchema,
  })
  .passthrough();

const attendanceTodayItemSchema = z
  .object({
    id: nullableIntegerSchema,
    date: nullableStringSchema,
    start_time: nullableStringSchema,
    end_time: nullableStringSchema,
    check_in_status: nullableStringSchema,
    check_out_status: nullableStringSchema,
    attendance_status: nullableStringSchema,
    is_late: booleanishSchema.optional(),
    is_early_leave: booleanishSchema.optional(),
    work_duration: nullableStringSchema,
    schedule: attendanceScheduleSnapshotSchema.nullable().optional(),
  })
  .passthrough();

const attendanceHistoryItemSchema = z
  .object({
    id: nullableIntegerSchema,
    date: z.string().min(1),
    start_time: nullableStringSchema,
    end_time: nullableStringSchema,
    check_in_status: nullableStringSchema,
    check_out_status: nullableStringSchema,
    attendance_status: nullableStringSchema,
    is_late: booleanishSchema.optional(),
  })
  .passthrough();

const scheduleOfficeSchema = z
  .object({
    id: nullableIntegerSchema,
    name: nullableStringSchema,
    latitude: nullableNumberSchema,
    longitude: nullableNumberSchema,
    radius: nullableNumberSchema,
  })
  .passthrough();

const scheduleShiftSchema = z
  .object({
    id: nullableIntegerSchema,
    name: nullableStringSchema,
    start_time: nullableStringSchema,
    end_time: nullableStringSchema,
  })
  .passthrough();

const scheduleApiSchema = z
  .object({
    id: integerSchema,
    is_wfa: booleanishSchema.optional(),
    is_banned: booleanishSchema.optional(),
    office: scheduleOfficeSchema.nullable().optional(),
    shift: scheduleShiftSchema.nullable().optional(),
    office_id: nullableIntegerSchema,
    office_name: nullableStringSchema,
    office_radius: nullableNumberSchema,
    latitude: nullableNumberSchema,
    longitude: nullableNumberSchema,
    office_latitude: nullableNumberSchema,
    office_longitude: nullableNumberSchema,
    shift_id: nullableIntegerSchema,
    shift_name: nullableStringSchema,
    start_time: nullableStringSchema,
    end_time: nullableStringSchema,
    check_in_opens_at: nullableStringSchema,
    schedule_start_at: nullableStringSchema,
    schedule_end_at: nullableStringSchema,
    late_tolerance_minutes: nullableIntegerSchema,
    early_check_out_tolerance_minutes: nullableIntegerSchema,
    early_checkout_tolerance_minutes: nullableIntegerSchema,
  })
  .passthrough();

const presensiTodayPayloadSchema = z
  .object({
    today: attendanceTodayItemSchema.nullable().optional(),
    today_state: nullableStringSchema,
    active_schedule: scheduleApiSchema.nullable().optional(),
    this_month: z.array(attendanceHistoryItemSchema).default([]),
  })
  .passthrough();

export type PresensiHariIniResponse = {
  check_in_time: string | null;
  check_out_time: string | null;
  date: string;
  status: string;
  is_late: boolean;
  is_early_leave: boolean;
  work_duration: string | null;
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
  action: "clock_in" | "clock_out";
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
    id: number | null;
    name: string;
    latitude: number | null;
    longitude: number | null;
    radius: number | null;
  };
  shift: {
    id: number | null;
    name: string;
    start_time: string | null;
    end_time: string | null;
  };
  check_in_opens_at: string | null;
  schedule_start_at: string | null;
  schedule_end_at: string | null;
  late_tolerance_minutes: number | null;
  early_check_out_tolerance_minutes: number | null;
};

const PRESENSI_BASE_PATH = "/admin/api/v1/presensi";

const normalizeNumber = (value: number | null | undefined): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

const normalizeSchedule = (
  schedule: z.infer<typeof scheduleApiSchema>,
  fallback?: z.infer<typeof attendanceScheduleSnapshotSchema> | null
): ScheduleResponse => {
  const office = schedule.office ?? null;
  const shift = schedule.shift ?? null;

  return {
    id: schedule.id,
    is_wfa: schedule.is_wfa ?? false,
    is_banned: schedule.is_banned ?? false,
    office: {
      id: office?.id ?? schedule.office_id ?? null,
      name: office?.name ?? schedule.office_name ?? fallback?.office_name ?? "Lokasi kerja",
      latitude: normalizeNumber(
        office?.latitude ??
          schedule.latitude ??
          schedule.office_latitude ??
          fallback?.latitude
      ),
      longitude: normalizeNumber(
        office?.longitude ??
          schedule.longitude ??
          schedule.office_longitude ??
          fallback?.longitude
      ),
      radius: normalizeNumber(office?.radius ?? schedule.office_radius ?? null),
    },
    shift: {
      id: shift?.id ?? schedule.shift_id ?? null,
      name: shift?.name ?? schedule.shift_name ?? fallback?.shift_name ?? "Jadwal Kerja",
      start_time: shift?.start_time ?? schedule.start_time ?? fallback?.start_time ?? null,
      end_time: shift?.end_time ?? schedule.end_time ?? fallback?.end_time ?? null,
    },
    check_in_opens_at: schedule.check_in_opens_at ?? null,
    schedule_start_at: schedule.schedule_start_at ?? null,
    schedule_end_at: schedule.schedule_end_at ?? null,
    late_tolerance_minutes: schedule.late_tolerance_minutes ?? null,
    early_check_out_tolerance_minutes:
      schedule.early_check_out_tolerance_minutes ??
      schedule.early_checkout_tolerance_minutes ??
      fallback?.early_checkout_tolerance_minutes ??
      null,
  };
};

const fetchTodayPayload = async () => {
  const response = await api.get(`${PRESENSI_BASE_PATH}/attendance/today`);
  return parseApiEnvelope(
    presensiTodayPayloadSchema,
    response.data,
    "Gagal memuat data presensi."
  );
};

export async function getPresensiHariIni(): Promise<PresensiHariIniResponse> {
  const payload = await fetchTodayPayload();
  const today = payload.today;

  return {
    check_in_time: today?.start_time ?? null,
    check_out_time: today?.end_time ?? null,
    date: today?.date ?? dayjs().format("YYYY-MM-DD"),
    status:
      today?.attendance_status ??
      payload.today_state ??
      (today ? "present" : "absent"),
    is_late: today?.is_late ?? today?.check_in_status === "late",
    is_early_leave:
      today?.is_early_leave ?? today?.check_out_status === "early_leave",
    work_duration: today?.work_duration ?? null,
  };
}

export async function getRiwayatPresensi(
  month: number,
  year: number
): Promise<PresensiRecord[]> {
  const response = await api.get(
    `${PRESENSI_BASE_PATH}/attendance/history/${month}/${year}`
  );
  const records = parseApiEnvelope(
    z.array(attendanceHistoryItemSchema),
    response.data,
    "Gagal memuat riwayat presensi."
  );

  return records.map((record: z.infer<typeof attendanceHistoryItemSchema>, index: number) => ({
    id: record.id ?? record.date ?? index,
    date: record.date,
    check_in_time: record.start_time ?? null,
    check_out_time: record.end_time ?? null,
    status:
      record.attendance_status ??
      (record.start_time ? "present" : "absent"),
    is_late: record.is_late ?? record.check_in_status === "late",
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

  const endpoint =
    data.action === "clock_out"
      ? `${PRESENSI_BASE_PATH}/attendance/check-out`
      : `${PRESENSI_BASE_PATH}/attendance/check-in`;

  const response = await api.post(endpoint, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return parseApiResult(response.data, "Gagal mengirim presensi.");
}

export async function getSchedule(): Promise<ScheduleResponse> {
  const response = await api.get(`${PRESENSI_BASE_PATH}/schedule`);
  const payload = parseApiEnvelope(
    scheduleApiSchema,
    response.data,
    "Gagal memuat jadwal."
  );
  const normalizedSchedule = normalizeSchedule(payload);

  if (
    normalizedSchedule.is_wfa ||
    (normalizedSchedule.office.latitude !== null &&
      normalizedSchedule.office.longitude !== null)
  ) {
    return normalizedSchedule;
  }

  try {
    const todayPayload = await fetchTodayPayload();
    if (todayPayload.active_schedule) {
      return normalizeSchedule(
        todayPayload.active_schedule,
        todayPayload.today?.schedule ?? null
      );
    }

    if (todayPayload.today?.schedule) {
      return {
        ...normalizedSchedule,
        office: {
          ...normalizedSchedule.office,
          name:
            todayPayload.today.schedule.office_name ??
            normalizedSchedule.office.name,
          latitude:
            normalizedSchedule.office.latitude ??
            todayPayload.today.schedule.latitude ??
            null,
          longitude:
            normalizedSchedule.office.longitude ??
            todayPayload.today.schedule.longitude ??
            null,
        },
        shift: {
          ...normalizedSchedule.shift,
          name:
            todayPayload.today.schedule.shift_name ??
            normalizedSchedule.shift.name,
          start_time:
            normalizedSchedule.shift.start_time ??
            todayPayload.today.schedule.start_time ??
            null,
          end_time:
            normalizedSchedule.shift.end_time ??
            todayPayload.today.schedule.end_time ??
            null,
        },
      };
    }
  } catch {
    return normalizedSchedule;
  }

  return normalizedSchedule;
}
