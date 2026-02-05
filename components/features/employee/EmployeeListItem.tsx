import React from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/ui/text";
import { type Employee } from "@/services/employee";
import { useRouter } from "expo-router";

function getDisplayName(employee: Employee) {
  return [employee.first_name, employee.last_name].filter(Boolean).join(" ").trim();
}

function getInitials(name: string) {
  const tokens = name.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return "?";
  if (tokens.length === 1) return tokens[0].slice(0, 2).toUpperCase();
  return `${tokens[0][0]}${tokens[1][0]}`.toUpperCase();
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
    </TouchableOpacity>
  );
}
