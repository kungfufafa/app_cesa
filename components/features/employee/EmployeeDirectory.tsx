import React from "react";
import { FlatList, View } from "react-native";
import { useQuery } from "@tanstack/react-query";

import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/text";
import { Skeleton } from "@/components/ui/skeleton";
import { EmployeeListItem } from "@/components/features/employee/EmployeeListItem";
import { getEmployeeDirectory, type Employee } from "@/services/employee";

function matchesSearch(employee: Employee, q: string) {
  const haystack = [
    employee.first_name,
    employee.last_name,
    employee.email,
    employee.id_employee,
    employee.branch,
    employee.job,
    employee.organization,
    employee.title,
    employee.mobile_phone,
    employee.phone,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(q);
}

export function EmployeeDirectory() {
  const [query, setQuery] = React.useState("");
  const q = query.trim().toLowerCase();

  const {
    data: employees,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["employee-directory"],
    queryFn: getEmployeeDirectory,
  });

  const filteredEmployees = React.useMemo(() => {
    const list = employees ?? [];
    if (!q) return list;
    return list.filter((employee) => matchesSearch(employee, q));
  }, [employees, q]);

  if (isLoading) {
    return <EmployeeDirectorySkeleton />;
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

  return (
    <View className="flex-1 bg-background">
      <View className="px-4 pt-2 pb-3">
        <Text variant="h3" className="mb-1">
          Employee Directory
        </Text>
        <Text variant="muted" className="mb-3">
          Total: {filteredEmployees.length} employee
          {filteredEmployees.length === 1 ? "" : "s"}
        </Text>

        <Input
          placeholder="Cari nama / email / branch / job..."
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          className="bg-card"
          returnKeyType="search"
        />
      </View>

      <FlatList
        data={filteredEmployees}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-4 pb-10"
        ItemSeparatorComponent={() => <View className="h-3" />}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => <EmployeeListItem employee={item} />}
        ListEmptyComponent={
          <View className="py-10 items-center">
            <Text className="font-medium text-foreground mb-1">
              Data tidak ditemukan
            </Text>
            <Text variant="muted" className="text-center">
              Coba kata kunci lain.
            </Text>
          </View>
        }
      />
    </View>
  );
}

function EmployeeDirectorySkeleton() {
  const items = Array.from({ length: 6 }, (_, index) => index);

  return (
    <View className="flex-1 bg-background">
      <View className="px-4 pt-2 pb-3">
        <Skeleton className="h-7 w-48 mb-2" />
        <Skeleton className="h-4 w-56 mb-3" />
        <Skeleton className="h-11 w-full rounded-lg" />
      </View>

      <View className="px-4 pb-10 gap-3">
        {items.map((item) => (
          <View
            key={item}
            className="flex-row items-center p-4 bg-card rounded-xl border border-border"
          >
            <Skeleton className="w-11 h-11 rounded-full" />
            <View className="flex-1 ml-4 gap-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-24" />
            </View>
            <View className="flex-row items-center gap-2 ml-3">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="w-8 h-8 rounded-full" />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
