import api from "@/services/api";
import { ApiResponse } from "./types";

export type AttendanceTodayResponse = {
  check_in_time: string | null;
  check_out_time: string | null;
  date: string;
  status: string; // 'present', 'absent', 'late', etc.
};

export type AttendanceRecord = {
  id: number | string;
  date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  status: string;
  is_late: boolean;
};

export type AttendanceSubmission = {
  photoUri: string;
  latitude: number;
  longitude: number;
};

type AttendanceTodayApiData = {
  today: {
    start_time: string | null;
    end_time: string | null;
  } | null;
  this_month: Array<{
    start_time: string | null;
    end_time: string | null;
    date: string;
  }>;
};

type AttendanceHistoryApiRecord = {
  start_time: string | null;
  end_time: string | null;
  date: string;
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

export async function getAttendanceToday(): Promise<AttendanceTodayResponse> {
  const response = await api.get<ApiResponse<AttendanceTodayApiData>>(
    "/api/get-attendance-today"
  );

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to fetch attendance.");
  }

  const today = response.data.data?.today ?? null;
  const todayDate = new Date().toISOString().slice(0, 10);

  return {
    check_in_time: today?.start_time ?? null,
    check_out_time: today?.end_time ?? null,
    date: todayDate,
    status: today ? "present" : "absent",
  };
}

export async function getAttendanceHistory(
  month: number,
  year: number
): Promise<AttendanceRecord[]> {
  const response = await api.get<ApiResponse<AttendanceHistoryApiRecord[]>>(
    `/api/get-attendance-by-month-year/${month}/${year}`
  );

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to fetch attendance history.");
  }

  const records = response.data.data ?? [];

  return records.map((record, index) => ({
    id: record.date || index,
    date: record.date,
    check_in_time: record.start_time ?? null,
    check_out_time: record.end_time ?? null,
    status: record.start_time ? "present" : "absent",
    is_late: false,
  }));
}

export type SubmitAttendanceResponse = {
  success: boolean;
  message: string;
};

export async function submitAttendance(data: AttendanceSubmission): Promise<SubmitAttendanceResponse> {
  const formData = new FormData();
  formData.append("latitude", String(data.latitude));
  formData.append("longitude", String(data.longitude));

  const filename = data.photoUri.split("/").pop() || "photo.jpg";
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : `image/jpeg`;

  // @ts-ignore - React Native expects this format for FormData
  formData.append("photo", {
    uri: data.photoUri,
    name: filename,
    type,
  });

  const response = await api.post<SubmitAttendanceResponse>("/api/store-attendance", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

export async function getSchedule(): Promise<ScheduleResponse> {
  const response = await api.get<ApiResponse<ScheduleResponse | null>>(
    "/api/get-schedule"
  );

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to fetch schedule.");
  }

  if (!response.data.data) {
    throw new Error(response.data.message || "Schedule not available.");
  }

  return response.data.data;
}

export async function getProfilePhoto(): Promise<string | null> {
  const response = await api.get<ApiResponse<string | null>>("/api/get-photo");

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to fetch profile photo.");
  }

  return response.data.data ?? null;
}
