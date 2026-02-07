import React from "react";
import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

export type AttendanceStatus =
  | "present"
  | "hadir"
  | "late"
  | "terlambat"
  | "absent"
  | "alpa"
  | "leave"
  | "izin"
  | "excused"
  | "permission"
  | "sick"
  | "sakit"
  | "holiday"
  | "libur"
  | "unknown";

interface AttendanceStatusBadgeProps {
  status: string;
  isLate?: boolean;
  className?: string;
}

function getStatusConfig(status: string, isLate?: boolean) {
  const s = status?.toLowerCase() ?? "unknown";

  if (s === "present" || s === "hadir") {
    if (isLate) {
      return {
        containerClass: "bg-orange-100",
        textClass: "text-orange-700",
        label: "Terlambat",
      };
    }
    return {
      containerClass: "bg-emerald-100",
      textClass: "text-emerald-700",
      label: "Hadir",
    };
  }

  if (s === "late" || s === "terlambat") {
    return {
      containerClass: "bg-orange-100",
      textClass: "text-orange-700",
      label: "Terlambat",
    };
  }

  if (s === "absent" || s === "alpa") {
    return {
      containerClass: "bg-red-100",
      textClass: "text-red-700",
      label: "Alpa",
    };
  }

  if (s === "excused" || s === "permission" || s === "leave" || s === "izin") {
    return {
      containerClass: "bg-blue-100",
      textClass: "text-blue-700",
      label: "Izin",
    };
  }

  if (s === "sick" || s === "sakit") {
    return {
      containerClass: "bg-yellow-100",
      textClass: "text-yellow-700",
      label: "Sakit",
    };
  }

  if (s === "holiday" || s === "libur") {
    return {
      containerClass: "bg-purple-100",
      textClass: "text-purple-700",
      label: "Libur",
    };
  }

  return {
    containerClass: "bg-secondary",
    textClass: "text-muted-foreground",
    label: status || "-",
  };
}

export function AttendanceStatusBadge({
  status,
  isLate,
  className,
}: AttendanceStatusBadgeProps) {
  const config = getStatusConfig(status, isLate);

  return (
    <View
      className={cn(
        "px-3 py-1.5 rounded-full items-center justify-center min-w-[72px]",
        config.containerClass,
        className,
      )}
    >
      <Text className={cn("text-xs font-bold capitalize", config.textClass)}>
        {config.label}
      </Text>
    </View>
  );
}
