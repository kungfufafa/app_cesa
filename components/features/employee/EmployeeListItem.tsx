import React from "react";
import { Image, Pressable, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/ui/text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { type Employee } from "@/services/employee";
import { useRouter } from "expo-router";
import { openExternalUrl } from "@/lib/open-url";

function getDisplayName(employee: Employee) {
  return [employee.first_name, employee.last_name].filter(Boolean).join(" ").trim();
}

function getInitials(name: string) {
  const tokens = name.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return "?";
  if (tokens.length === 1) return tokens[0].slice(0, 2).toUpperCase();
  return `${tokens[0][0]}${tokens[1][0]}`.toUpperCase();
}

function formatPhoneForWhatsApp(input?: string | null) {
  if (!input) return "";
  let digits = input.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("0")) {
    digits = `62${digits.slice(1)}`;
  } else if (digits.startsWith("8")) {
    digits = `62${digits}`;
  }
  return digits;
}

function formatPhoneForTel(input?: string | null) {
  if (!input) return "";
  return input.replace(/[^\d+]/g, "");
}

type EmployeeListItemProps = {
  employee: Employee;
};

export function EmployeeListItem({ employee }: EmployeeListItemProps) {
  const router = useRouter();
  const name = getDisplayName(employee);
  const avatarUri =
    employee.avatar && !employee.avatar.endsWith("/blank.jpg")
      ? employee.avatar
      : null;
  const mobilePhone = employee.mobile_phone?.trim() || "";
  const landlinePhone = employee.phone?.trim() || "";
  const telPhone = formatPhoneForTel(landlinePhone || mobilePhone);
  const waPhone = formatPhoneForWhatsApp(mobilePhone || landlinePhone);
  const hasTel = Boolean(telPhone);
  const hasWa = Boolean(waPhone);

  return (
    <TouchableOpacity
      className="flex-row items-center p-4 bg-card rounded-xl border border-border active:bg-secondary/40"
      activeOpacity={0.7}
      onPress={() => router.push(`/employee/${employee.id}`)}
    >
      <View className="w-11 h-11 rounded-full bg-secondary/60 border border-border items-center justify-center overflow-hidden mr-4">
        {avatarUri ? (
          <Image
            source={{ uri: avatarUri }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <Text className="text-sm font-semibold text-foreground">
            {getInitials(name || employee.email || "?")}
          </Text>
        )}
      </View>

      <View className="flex-1">
        <Text className="text-base font-medium text-foreground" numberOfLines={1}>
          {name || employee.email || employee.id_employee}
        </Text>
        <Text className="text-xs text-muted-foreground mt-0.5" numberOfLines={1}>
          {employee.job}
          {employee.branch ? ` • ${employee.branch}` : ""}
        </Text>
        <Text className="text-[11px] text-muted-foreground mt-1" numberOfLines={1}>
          ID: {employee.id_employee}
        </Text>
      </View>

      <View className="flex-row items-center gap-2 ml-3">
        <Pressable
          className={`w-8 h-8 rounded-full border border-border items-center justify-center ${
            hasTel ? "bg-card active:bg-secondary/40" : "bg-muted/40"
          }`}
          accessibilityRole="button"
          accessibilityLabel="Telepon"
          disabled={!hasTel}
          onPress={(e) => {
            e.stopPropagation();
            if (hasTel) {
              void openExternalUrl(`tel:${telPhone}`, {
                fallbackMessage: "Tidak bisa membuka Telepon di perangkat ini.",
              });
            }
          }}
        >
          <IconSymbol name="phone.fill" size={16} color="#71717a" />
        </Pressable>
        <Pressable
          className={`w-8 h-8 rounded-full border border-border items-center justify-center ${
            hasWa ? "bg-card active:bg-secondary/40" : "bg-muted/40"
          }`}
          accessibilityRole="button"
          accessibilityLabel="WhatsApp"
          disabled={!hasWa}
          onPress={(e) => {
            e.stopPropagation();
            if (hasWa) {
              void openExternalUrl(`https://wa.me/${waPhone}`, {
                fallbackMessage:
                  "Tidak bisa membuka WhatsApp di perangkat ini.",
              });
            }
          }}
        >
          <IconSymbol name="message.fill" size={16} color="#71717a" />
        </Pressable>
      </View>
    </TouchableOpacity>
  );
}
