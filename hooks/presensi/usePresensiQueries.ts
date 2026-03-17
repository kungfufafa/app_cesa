import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPresensiHariIni,
  getRiwayatPresensi,
  getSchedule,
} from "@/services/presensi/presensi";
import {
  getLeaves,
  getOvertimes,
  submitLeave,
  submitOvertime,
} from "@/services/presensi/forms";

const presensiKeys = {
  all: ["presensi"] as const,
  today: () => [...presensiKeys.all, "today"] as const,
  schedule: () => [...presensiKeys.all, "schedule"] as const,
  history: (month: number, year: number) =>
    [...presensiKeys.all, "history", month, year] as const,
  leaves: () => [...presensiKeys.all, "leaves"] as const,
  overtimes: () => [...presensiKeys.all, "overtimes"] as const,
};

export function usePresensiHariIni() {
  return useQuery({
    queryKey: presensiKeys.today(),
    queryFn: getPresensiHariIni,
  });
}

export function useSchedule() {
  return useQuery({
    queryKey: presensiKeys.schedule(),
    queryFn: getSchedule,
  });
}

export function useRiwayatPresensi(month: number, year: number) {
  return useQuery({
    queryKey: presensiKeys.history(month, year),
    queryFn: () => getRiwayatPresensi(month, year),
  });
}

export function useLeaveList() {
  return useQuery({
    queryKey: presensiKeys.leaves(),
    queryFn: getLeaves,
  });
}

export function useOvertimeList() {
  return useQuery({
    queryKey: presensiKeys.overtimes(),
    queryFn: getOvertimes,
  });
}

export function useSubmitLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitLeave,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: presensiKeys.leaves() });
    },
  });
}

export function useSubmitOvertime() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitOvertime,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: presensiKeys.overtimes() });
    },
  });
}
