import React from "react";
import { Image, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";

import { Text } from "@/components/ui/text";
import { Skeleton } from "@/components/ui/skeleton";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { getEmployeeDirectory, type Employee } from "@/services/employee";
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
  const cleaned = input.replace(/[^\d+]/g, "");
  return cleaned;
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
    <View className="gap-1">
      <Text className="text-xs text-muted-foreground">{label}</Text>
      <Text className="text-base text-foreground">{display}</Text>
    </View>
  );
}

export function EmployeeDetail({ employeeId }: { employeeId?: string }) {
  const insets = useSafeAreaInsets();
  const { data: employees, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["employee-directory"],
    queryFn: getEmployeeDirectory,
  });

  const employee = React.useMemo(() => {
    if (!employeeId) return undefined;
    return (employees ?? []).find((e) => String(e.id) === String(employeeId));
  }, [employees, employeeId]);

  if (isLoading) {
    return <EmployeeDetailSkeleton />;
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
  const email = employee.email?.trim() || "";
  const mobilePhone = employee.mobile_phone?.trim() || "";
  const landlinePhone = employee.phone?.trim() || "";
  const telPhone = formatPhoneForTel(landlinePhone || mobilePhone);
  const waPhone = formatPhoneForWhatsApp(mobilePhone || landlinePhone);
  const hasEmail = Boolean(email);
  const hasTel = Boolean(telPhone);
  const hasWa = Boolean(waPhone);

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-4 pt-2"
      contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
    >
      <View className="bg-card rounded-xl border border-border p-4">
        <View className="items-center gap-3">
          <View className="w-24 h-24 rounded-full bg-secondary/60 border border-border items-center justify-center overflow-hidden">
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
          <View className="items-center gap-1">
            <Text variant="h3" className="text-center" numberOfLines={2}>
              {name || employee.email || employee.id_employee}
            </Text>
            <Text variant="muted" className="text-center">
              {employee.job}
            </Text>
          </View>
          {(hasEmail || hasTel || hasWa) ? (
            <View className="flex-row gap-3">
              {hasEmail ? (
                <Pressable
                  className="w-10 h-10 rounded-full border border-border items-center justify-center bg-card active:bg-secondary/50"
                  accessibilityRole="button"
                  accessibilityLabel="Email"
                  onPress={() => {
                    void openExternalUrl(`mailto:${email}`, {
                      fallbackMessage:
                        "Tidak bisa membuka aplikasi Email di perangkat ini.",
                    });
                  }}
                >
                  <IconSymbol name="envelope.fill" size={18} color="#71717a" />
                </Pressable>
              ) : null}
              {hasTel ? (
                <Pressable
                  className="w-10 h-10 rounded-full border border-border items-center justify-center bg-card active:bg-secondary/50"
                  accessibilityRole="button"
                  accessibilityLabel="Telepon"
                  onPress={() => {
                    void openExternalUrl(`tel:${telPhone}`, {
                      fallbackMessage:
                        "Tidak bisa membuka Telepon di perangkat ini.",
                    });
                  }}
                >
                  <IconSymbol name="phone.fill" size={18} color="#71717a" />
                </Pressable>
              ) : null}
              {hasWa ? (
                <Pressable
                  className="w-10 h-10 rounded-full border border-border items-center justify-center bg-card active:bg-secondary/50"
                  accessibilityRole="button"
                  accessibilityLabel="WhatsApp"
                  onPress={() => {
                    void openExternalUrl(`https://wa.me/${waPhone}`, {
                      fallbackMessage:
                        "Tidak bisa membuka WhatsApp di perangkat ini.",
                    });
                  }}
                >
                  <IconSymbol name="message.fill" size={18} color="#71717a" />
                </Pressable>
              ) : null}
            </View>
          ) : null}
        </View>
      </View>

      <View className="h-3" />

      <View className="bg-card rounded-xl border border-border p-4">
        <Text className="text-sm font-semibold text-foreground mb-3">
          Informasi Kerja
        </Text>
        <View className="gap-3">
          <Field label="ID" value={employee.id_employee} />
          <Field label="Branch" value={employee.branch} />
          <Field label="Organization" value={employee.organization} />
          <Field label="Title" value={employee.title} />
          <Field label="Job" value={employee.job} />
          <Field label="Join Date" value={employee.join_date} />
        </View>
      </View>

      <View className="h-3" />

      <View className="bg-card rounded-xl border border-border p-4">
        <Text className="text-sm font-semibold text-foreground mb-3">
          Kontak
        </Text>
        <View className="gap-3">
          <Field label="Email" value={employee.email} />
          <Field label="Mobile Phone" value={employee.mobile_phone} />
          <Field label="Phone" value={employee.phone} />
        </View>
      </View>

      <View className="h-3" />

      <View className="bg-card rounded-xl border border-border p-4">
        <Text className="text-sm font-semibold text-foreground mb-3">
          Data Personal
        </Text>
        <View className="gap-3">
          <Field label="Gender" value={employee.gender} />
          <Field label="Birth Date" value={employee.birth_date} />
          <Field label="Marital Status" value={employee.marital_status} />
          <Field label="Tax Status" value={employee.tax_status} />
          <Field label="Religion" value={employee.religion} />
          <Field label="Blood Type" value={employee.blood_type} />
        </View>
      </View>
    </ScrollView>
  );
}

function EmployeeDetailSkeleton() {
  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-4 pt-2 pb-6"
    >
      <View className="bg-card rounded-xl border border-border p-4">
        <View className="items-center gap-3">
          <Skeleton className="w-24 h-24 rounded-full" />
          <View className="items-center gap-2 w-full">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-28" />
          </View>
          <View className="flex-row gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="w-10 h-10 rounded-full" />
          </View>
        </View>
      </View>

      <View className="h-3" />

      <DetailSectionSkeleton titleWidth="w-36" rows={6} />

      <View className="h-3" />

      <DetailSectionSkeleton titleWidth="w-20" rows={3} />

      <View className="h-3" />

      <DetailSectionSkeleton titleWidth="w-28" rows={6} />
    </ScrollView>
  );
}

function DetailSectionSkeleton({
  titleWidth,
  rows,
}: {
  titleWidth: string;
  rows: number;
}) {
  return (
    <View className="bg-card rounded-xl border border-border p-4">
      <Skeleton className={`h-4 ${titleWidth} mb-4`} />
      <View className="gap-3">
        {Array.from({ length: rows }, (_, index) => (
          <View key={index} className="gap-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-40" />
          </View>
        ))}
      </View>
    </View>
  );
}
