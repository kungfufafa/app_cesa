import React, { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Href, router } from "expo-router";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

import { HelpdeskSelectionModal } from "@/components/features/helpdesk/HelpdeskSelectionModal";
import { HelpdeskTicketCard } from "@/components/features/helpdesk/HelpdeskTicketCard";
import { SheetHeader, SheetModal, SheetView } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/text";
import { useHelpdeskMeta, useHelpdeskTicketList } from "@/hooks/helpdesk/useHelpdeskQueries";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAuthBottomSheet } from "@/store/useAuthBottomSheet";
import type {
  HelpdeskBoxKey,
  HelpdeskListParams,
  HelpdeskMeta,
} from "@/services/helpdesk";

type FilterState = Pick<
  HelpdeskListParams,
  "priority_id" | "ticket_status_id" | "unit_id" | "problem_category_id" | "responsible_id"
>;

const defaultFilters: FilterState = {
  priority_id: undefined,
  ticket_status_id: undefined,
  unit_id: undefined,
  problem_category_id: undefined,
  responsible_id: undefined,
};

export default function InboxScreen() {
  const { isAuthenticated } = useRequireAuth();
  const openSheet = useAuthBottomSheet((s) => s.open);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim());
  const [activeBox, setActiveBox] = useState<HelpdeskBoxKey | undefined>();
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [draftFilters, setDraftFilters] = useState<FilterState>(defaultFilters);

  const { data: meta, isLoading: isMetaLoading, error: metaError } = useHelpdeskMeta();
  const { data: filterMeta } = useHelpdeskMeta(
    isFilterVisible ? draftFilters.unit_id : filters.unit_id
  );

  const listQuery = useHelpdeskTicketList({
    box: activeBox,
    search: deferredSearch || undefined,
    ...filters,
    per_page: 20,
  });

  const tickets = listQuery.data?.pages.flatMap((page) => page.data) ?? [];
  const firstPage = listQuery.data?.pages[0];

  useEffect(() => {
    if (!activeBox && firstPage?.meta.box) {
      setActiveBox(firstPage.meta.box);
    }
  }, [activeBox, firstPage?.meta.box]);

  useEffect(() => {
    if (!isFilterVisible) {
      setDraftFilters(filters);
    }
  }, [filters, isFilterVisible]);

  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center px-6">
          <View className="w-20 h-20 rounded-full bg-secondary items-center justify-center mb-4 border border-border">
            <IconSymbol name="headphones" size={32} color="#71717a" />
          </View>
          <Text variant="h3" className="mb-2">
            Helpdesk
          </Text>
          <Text variant="muted" className="text-center mb-6">
            Login untuk melihat dan membuat tiket helpdesk.
          </Text>
          <Button onPress={() => openSheet()}>
            <Text className="text-primary-foreground">Login</Text>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const isInitialLoading =
    isMetaLoading || (listQuery.isLoading && tickets.length === 0);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={listQuery.isRefetching && !listQuery.isFetchingNextPage}
            onRefresh={() => {
              void Promise.all([listQuery.refetch(), meta ? Promise.resolve() : Promise.resolve()]);
            }}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-4">
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <Text variant="h3">Helpdesk</Text>
              <Text className="text-sm text-muted-foreground mt-1">
                Pantau tiket masuk, buat laporan baru, dan lanjutkan proses sampai selesai.
              </Text>
            </View>
            <Button size="sm" onPress={() => router.push("/helpdesk/create" as Href)}>
              <Text className="text-primary-foreground font-bold">Tiket Baru</Text>
            </Button>
          </View>

          <View className="rounded-[24px] border border-border bg-card px-4 py-4 gap-4">
            <Input
              value={search}
              onChangeText={setSearch}
              placeholder="Cari judul tiket atau kata kunci"
            />
            <View className="flex-row gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onPress={() => setIsFilterVisible(true)}
              >
                <Text>Filter</Text>
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onPress={() => {
                  setSearch("");
                  setFilters(defaultFilters);
                  setActiveBox(firstPage?.meta.box);
                }}
              >
                <Text>Reset</Text>
              </Button>
            </View>
          </View>

          {meta?.boxes?.length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {meta.boxes.map((box) => {
                  const isActive = box.key === (activeBox ?? firstPage?.meta.box);
                  const count = firstPage?.meta.counts?.[box.key] ?? 0;

                  return (
                    <Pressable
                      key={box.key}
                      className={`rounded-full border px-4 py-2 ${isActive ? "border-primary bg-primary/10" : "border-border bg-card"}`}
                      onPress={() => setActiveBox(box.key)}
                    >
                      <Text className={isActive ? "text-primary font-semibold" : "text-muted-foreground"}>
                        {box.label} ({count})
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          ) : null}

          {isInitialLoading ? (
            <View className="py-20 items-center">
              <ActivityIndicator size="large" color="#2563eb" />
            </View>
          ) : metaError || listQuery.error ? (
            <View className="rounded-[24px] border border-border bg-card px-5 py-10 items-center">
              <IconSymbol name="nosign" size={42} color="#ef4444" />
              <Text className="font-semibold mt-4">Gagal memuat helpdesk</Text>
              <Text className="text-sm text-muted-foreground text-center mt-2">
                Coba muat ulang halaman atau periksa koneksi internet Anda.
              </Text>
              <Button className="mt-5" onPress={() => void Promise.all([listQuery.refetch()])}>
                <Text className="text-primary-foreground font-bold">Coba Lagi</Text>
              </Button>
            </View>
          ) : tickets.length === 0 ? (
            <View className="rounded-[24px] border border-dashed border-border px-5 py-16 items-center bg-card">
              <View className="w-16 h-16 rounded-full bg-secondary items-center justify-center mb-4">
                <IconSymbol name="tray.fill" size={30} color="#71717a" />
              </View>
              <Text className="font-semibold text-lg">Belum ada tiket</Text>
              <Text className="text-sm text-muted-foreground text-center mt-2">
                Tiket helpdesk yang sesuai pencarian dan filter akan muncul di sini.
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {tickets.map((ticket) => (
                <HelpdeskTicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onPress={() => router.push(`/helpdesk/${ticket.id}` as Href)}
                />
              ))}

              {listQuery.hasNextPage ? (
                <Button
                  variant="outline"
                  onPress={() => void listQuery.fetchNextPage()}
                  disabled={listQuery.isFetchingNextPage}
                >
                  <Text>
                    {listQuery.isFetchingNextPage ? "Memuat..." : "Muat Halaman Berikutnya"}
                  </Text>
                </Button>
              ) : null}
            </View>
          )}
        </View>
      </ScrollView>

      <HelpdeskFilterModal
        visible={isFilterVisible}
        draftFilters={draftFilters}
        meta={filterMeta ?? meta}
        onClose={() => setIsFilterVisible(false)}
        onChange={setDraftFilters}
        onApply={() => {
          setFilters(draftFilters);
          setIsFilterVisible(false);
        }}
        onReset={() => {
          setDraftFilters(defaultFilters);
          setFilters(defaultFilters);
          setIsFilterVisible(false);
        }}
      />
    </SafeAreaView>
  );
}

function HelpdeskFilterModal({
  visible,
  draftFilters,
  meta,
  onClose,
  onChange,
  onApply,
  onReset,
}: {
  visible: boolean;
  draftFilters: FilterState;
  meta?: HelpdeskMeta;
  onClose: () => void;
  onChange: (filters: FilterState) => void;
  onApply: () => void;
  onReset: () => void;
}) {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["65%"], []);
  const [activeField, setActiveField] = useState<
    "priority_id" | "ticket_status_id" | "unit_id" | "problem_category_id" | "responsible_id" | null
  >(null);

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
      setActiveField(null);
    }
  }, [visible]);

  const categories = meta?.problem_categories ?? [];
  const responsibleUsers = meta?.responsible_users ?? [];

  const findLabel = (
    items: { id: number; name: string }[],
    id?: number
  ) => items.find((item) => item.id === id)?.name ?? "Semua";

  return (
    <>
      <SheetModal ref={bottomSheetRef} snapPoints={snapPoints} onDismiss={onClose}>
        <SheetView className="flex-1 px-5 pt-5 pb-8 gap-4">
          <SheetHeader
            title="Filter Tiket"
            description="Pilih filter yang ingin diterapkan ke daftar tiket."
            onClose={onClose}
          />

          <FilterRow
            label="Prioritas"
            value={findLabel(meta?.priorities ?? [], draftFilters.priority_id)}
            onPress={() => setActiveField("priority_id")}
          />
          <FilterRow
            label="Status"
            value={findLabel(meta?.statuses ?? [], draftFilters.ticket_status_id)}
            onPress={() => setActiveField("ticket_status_id")}
          />
          <FilterRow
            label="Unit"
            value={findLabel(meta?.units ?? [], draftFilters.unit_id)}
            onPress={() => setActiveField("unit_id")}
          />
          <FilterRow
            label="Kategori"
            value={findLabel(categories, draftFilters.problem_category_id)}
            onPress={() => setActiveField("problem_category_id")}
          />
          <FilterRow
            label="Responsible"
            value={findLabel(responsibleUsers, draftFilters.responsible_id)}
            onPress={() => setActiveField("responsible_id")}
          />

          <View className="flex-row gap-3 pt-2">
            <Button variant="outline" className="flex-1" onPress={onReset}>
              <Text>Reset</Text>
            </Button>
            <Button className="flex-1" onPress={onApply}>
              <Text className="text-primary-foreground font-bold">Terapkan</Text>
            </Button>
          </View>
        </SheetView>
      </SheetModal>

      <HelpdeskSelectionModal
        visible={activeField === "priority_id"}
        title="Filter Prioritas"
        options={(meta?.priorities ?? []).map((item) => ({
          label: item.name,
          value: item.id,
        }))}
        selectedValue={draftFilters.priority_id}
        onClose={() => setActiveField(null)}
        onSelect={(value) =>
          onChange({
            ...draftFilters,
            priority_id: value == null ? undefined : Number(value),
          })
        }
        allowClear
      />
      <HelpdeskSelectionModal
        visible={activeField === "ticket_status_id"}
        title="Filter Status"
        options={(meta?.statuses ?? []).map((item) => ({
          label: item.name,
          value: item.id,
        }))}
        selectedValue={draftFilters.ticket_status_id}
        onClose={() => setActiveField(null)}
        onSelect={(value) =>
          onChange({
            ...draftFilters,
            ticket_status_id: value == null ? undefined : Number(value),
          })
        }
        allowClear
      />
      <HelpdeskSelectionModal
        visible={activeField === "unit_id"}
        title="Filter Unit"
        options={(meta?.units ?? []).map((item) => ({
          label: item.name,
          value: item.id,
        }))}
        selectedValue={draftFilters.unit_id}
        onClose={() => setActiveField(null)}
        onSelect={(value) =>
          onChange({
            ...draftFilters,
            unit_id: value == null ? undefined : Number(value),
            problem_category_id: undefined,
            responsible_id: undefined,
          })
        }
        allowClear
      />
      <HelpdeskSelectionModal
        visible={activeField === "problem_category_id"}
        title="Filter Kategori"
        options={(categories ?? []).map((item) => ({
          label: item.name,
          value: item.id,
        }))}
        selectedValue={draftFilters.problem_category_id}
        onClose={() => setActiveField(null)}
        onSelect={(value) =>
          onChange({
            ...draftFilters,
            problem_category_id: value == null ? undefined : Number(value),
          })
        }
        allowClear
        emptyText={draftFilters.unit_id ? "Belum ada kategori." : "Pilih unit terlebih dulu."}
      />
      <HelpdeskSelectionModal
        visible={activeField === "responsible_id"}
        title="Filter Responsible"
        options={(responsibleUsers ?? []).map((item) => ({
          label: item.name,
          value: item.id,
        }))}
        selectedValue={draftFilters.responsible_id}
        onClose={() => setActiveField(null)}
        onSelect={(value) =>
          onChange({
            ...draftFilters,
            responsible_id: value == null ? undefined : Number(value),
          })
        }
        allowClear
      />
    </>
  );
}

function FilterRow({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      className="rounded-2xl border border-border bg-card px-4 py-3"
      onPress={onPress}
    >
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <Text className="font-semibold mt-1">{value}</Text>
    </Pressable>
  );
}
