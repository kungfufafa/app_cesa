import { useQuery } from "@tanstack/react-query";
import {
  getAttendanceToday,
  getAttendanceHistory,
  getSchedule,
} from "@/services/presensi/attendance";

export const presensiKeys = {
  all: ["presensi"] as const,
  today: () => [...presensiKeys.all, "today"] as const,
  schedule: () => [...presensiKeys.all, "schedule"] as const,
  history: (month: number, year: number) =>
    [...presensiKeys.all, "history", month, year] as const,
};

export function useAttendanceToday() {
  return useQuery({
    queryKey: presensiKeys.today(),
    queryFn: getAttendanceToday,
  });
}

export function useSchedule() {
  return useQuery({
    queryKey: presensiKeys.schedule(),
    queryFn: getSchedule,
  });
}

export function useAttendanceHistory(month: number, year: number) {
  return useQuery({
    queryKey: presensiKeys.history(month, year),
    queryFn: () => getAttendanceHistory(month, year),
  });
}
