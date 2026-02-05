import React from "react";
import { ActivityIndicator, Image, ScrollView, View } from "react-native";
import { useQuery } from "@tanstack/react-query";

import { Card, CardContent } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { getEmployeeDirectory, type Employee } from "@/services/employee";

function getDisplayName(employee: Employee) {
  return [employee.first_name, employee.last_name].filter(Boolean).join(" ").trim();
}

function getInitials(name: string) {
  const tokens = name.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return "?";
  if (tokens.length === 1) return tokens[0].slice(0, 2).toUpperCase();
  return `${tokens[0][0]}${tokens[1][0]}`.toUpperCase();
}

function Field({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  const display = value && value.trim().length > 0 ? value : "-";
  return (
    <View className="py-2">
      <Text className="text-xs text-muted-foreground mb-1">{label}</Text>
      <Text className="text-base text-foreground">{display}</Text>
    </View>
  );
}

export function EmployeeDetail({ employeeId }: { employeeId?: string }) {
  const { data: employees, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["employee-directory"],
    queryFn: getEmployeeDirectory,
  });

  const employee = React.useMemo(() => {
    if (!employeeId) return undefined;
    return (employees ?? []).find((e) => String(e.id) === String(employeeId));
  }, [employees, employeeId]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 justify-center items-center px-6">
        <Text variant="h4" className="mb-2">
          Gagal memuat data
        </Text>
        <Text variant="muted" className="text-center mb-6">
          Coba refresh lagi ya.
        </Text>
        <Text
          className="text-primary font-medium"
          onPress={() => refetch()}
          suppressHighlighting
        >
          {isRefetching ? "Loading..." : "Refresh"}
        </Text>
      </View>
    );
  }

  if (!employee) {
    return (
      <View className="flex-1 justify-center items-center px-6">
        <Text variant="h4" className="mb-2">
          Data tidak ditemukan
        </Text>
        <Text variant="muted" className="text-center">
          Karyawan dengan ID tersebut tidak ada di list.
        </Text>
      </View>
    );
  }

  const name = getDisplayName(employee);
  const avatarUri =
    employee.avatar && !employee.avatar.endsWith("/blank.jpg")
      ? employee.avatar
      : null;

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="p-4 pb-10">
      <Card className="py-0">
        <CardContent className="py-6 items-center">
          <View className="w-24 h-24 rounded-full bg-secondary/60 border border-border items-center justify-center overflow-hidden mb-4">
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <Text className="text-2xl font-semibold text-foreground">
                {getInitials(name || employee.email || "?")}
              </Text>
            )}
          </View>
          <Text variant="h3" className="text-center" numberOfLines={2}>
            {name || employee.email || employee.id_employee}
          </Text>
          <Text variant="muted" className="mt-1 text-center">
            {employee.job}
          </Text>
          <View className="bg-secondary px-2 py-0.5 rounded border border-border mt-3">
            <Text
              variant="small"
              className="text-muted-foreground text-[10px] uppercase tracking-wider"
            >
              ID: {employee.id_employee}
            </Text>
          </View>
        </CardContent>
      </Card>

      <View className="h-4" />

      <Card className="py-0">
        <CardContent className="py-4">
          <Text className="text-sm font-semibold text-foreground mb-2">
            Informasi Kerja
          </Text>
          <Field label="Branch" value={employee.branch} />
          <View className="h-[1px] bg-border" />
          <Field label="Organization" value={employee.organization} />
          <View className="h-[1px] bg-border" />
          <Field label="Title" value={employee.title} />
          <View className="h-[1px] bg-border" />
          <Field label="Job" value={employee.job} />
          <View className="h-[1px] bg-border" />
          <Field label="Join Date" value={employee.join_date} />
        </CardContent>
      </Card>

      <View className="h-4" />

      <Card className="py-0">
        <CardContent className="py-4">
          <Text className="text-sm font-semibold text-foreground mb-2">
            Kontak
          </Text>
          <Field label="Email" value={employee.email} />
          <View className="h-[1px] bg-border" />
          <Field label="Mobile Phone" value={employee.mobile_phone} />
          <View className="h-[1px] bg-border" />
          <Field label="Phone" value={employee.phone} />
        </CardContent>
      </Card>

      <View className="h-4" />

      <Card className="py-0">
        <CardContent className="py-4">
          <Text className="text-sm font-semibold text-foreground mb-2">
            Data Personal
          </Text>
          <Field label="Gender" value={employee.gender} />
          <View className="h-[1px] bg-border" />
          <Field label="Birth Date" value={employee.birth_date} />
          <View className="h-[1px] bg-border" />
          <Field label="Marital Status" value={employee.marital_status} />
          <View className="h-[1px] bg-border" />
          <Field label="Tax Status" value={employee.tax_status} />
          <View className="h-[1px] bg-border" />
          <Field label="Religion" value={employee.religion} />
          <View className="h-[1px] bg-border" />
          <Field label="Blood Type" value={employee.blood_type} />
        </CardContent>
      </Card>
    </ScrollView>
  );
}

