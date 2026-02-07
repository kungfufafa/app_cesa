import { Button } from "@/components/ui/Button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Text } from "@/components/ui/text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  getLeaves,
  LeaveItem,
  submitLeave,
} from "@/services/presensi/forms";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { isAxiosError } from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const LEAVE_TYPE_OPTIONS = ["Izin", "Sakit", "Cuti", "Lainnya"] as const;

function statusBadgeClass(status: string): { container: string; text: string } {
  switch (status.toLowerCase()) {
    case "approved":
      return { container: "bg-emerald-100", text: "text-emerald-700" };
    case "rejected":
      return { container: "bg-red-100", text: "text-red-700" };
    default:
      return { container: "bg-secondary", text: "text-muted-foreground" };
  }
}

function statusLabel(status: string): string {
  switch (status.toLowerCase()) {
    case "approved":
      return "Disetujui";
    case "rejected":
      return "Ditolak";
    default:
      return "Menunggu";
  }
}

function normalizeApiError(error: unknown): string {
  if (isAxiosError(error)) {
    const payload = error.response?.data as
      | {
          message?: string;
          errors?: Record<string, string[] | string>;
        }
      | undefined;

    if (payload?.errors) {
      const values = Object.values(payload.errors)
        .flatMap((value) => (Array.isArray(value) ? value : [value]))
        .filter(Boolean);

      if (values.length > 0) {
        return String(values[0]);
      }
    }

    if (payload?.message) {
      return payload.message;
    }
  }

  return "Terjadi kesalahan saat mengirim pengajuan";
}

export default function LeaveRequestScreen() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string }>();
  const createSheetRef = useRef<BottomSheetModal>(null);
  const createSheetSnapPoints = useMemo(() => ["65%", "82%"], []);

  const [leaveList, setLeaveList] = useState<LeaveItem[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isRefreshingList, setIsRefreshingList] = useState(false);
  const [hasLoadError, setHasLoadError] = useState(false);

  const [type, setType] = useState<(typeof LEAVE_TYPE_OPTIONS)[number]>("Izin");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!params.type) return;

    const normalizedType = LEAVE_TYPE_OPTIONS.find(
      (item) => item.toLowerCase() === params.type?.trim().toLowerCase()
    );

    if (normalizedType) {
      setType(normalizedType);
    }
  }, [params.type]);

  const loadLeaves = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshingList(true);
    } else {
      setIsLoadingList(true);
    }

    try {
      const items = await getLeaves();
      setLeaveList(items);
      setHasLoadError(false);
    } catch {
      if (!isRefresh) {
        setLeaveList([]);
      }
      setHasLoadError(true);
    } finally {
      if (isRefresh) {
        setIsRefreshingList(false);
      } else {
        setIsLoadingList(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadLeaves();
  }, [loadLeaves]);

  const openCreateSheet = () => {
    createSheetRef.current?.present();
  };

  const closeCreateSheet = () => {
    if (isSubmitting) return;
    createSheetRef.current?.dismiss();
  };

  const handleDismissCreateSheet = () => {
    if (isSubmitting) return;
    setType("Izin");
    setStartDate("");
    setEndDate("");
    setReason("");
  };

  const handleSubmit = async () => {
    if (!startDate.trim() || !endDate.trim() || !reason.trim()) {
      Alert.alert("Input Tidak Lengkap", "Mohon lengkapi tanggal dan alasan pengajuan.");
      return;
    }

    try {
      setIsSubmitting(true);
      await submitLeave({
        start_date: startDate.trim(),
        end_date: endDate.trim(),
        reason: reason.trim(),
        note: type,
      });

      createSheetRef.current?.dismiss();
      Alert.alert("Sukses", "Pengajuan izin/cuti berhasil dikirim.");
      await loadLeaves(true);
    } catch (error) {
      Alert.alert("Gagal", normalizeApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient
        colors={["#3b82f6", "#60a5fa", "#93c5fd"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-4"
        style={{ paddingTop: insets.top, paddingBottom: 10 }}
      >
        <View className="flex-row items-center">
          <Pressable
            className="w-9 h-9 rounded-full bg-white/20 items-center justify-center"
            onPress={() => router.back()}
            hitSlop={8}
          >
            <IconSymbol name="chevron.left" size={20} color="#fff" />
          </Pressable>
          <View className="flex-1 items-center">
            <Text className="text-white text-base font-semibold">Pengajuan Izin / Cuti</Text>
          </View>
          <View className="w-9 h-9" />
        </View>
      </LinearGradient>

      <View className="flex-1 px-4 pt-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-bold">Riwayat Pengajuan</Text>
          <TouchableOpacity
            onPress={() => void loadLeaves(true)}
            disabled={isRefreshingList}
            className="px-3 py-1.5 rounded-lg bg-secondary border border-border"
            activeOpacity={0.75}
          >
            {isRefreshingList ? (
              <ActivityIndicator size="small" />
            ) : (
              <Text variant="muted" className="text-xs font-semibold">
                Refresh
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <FlatList
          data={leaveList}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: insets.bottom + 90 }}
          ItemSeparatorComponent={() => <View className="h-3" />}
          ListEmptyComponent={
            isLoadingList ? (
              <View className="py-8 items-center">
                <ActivityIndicator />
              </View>
            ) : (
              <Text variant="muted">
                {hasLoadError
                  ? "Riwayat izin/cuti belum dapat dimuat."
                  : "Belum ada pengajuan izin/cuti."}
              </Text>
            )
          }
          renderItem={({ item }) => {
            const badgeClass = statusBadgeClass(item.status);

            return (
              <View className="rounded-xl border border-border bg-card p-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="font-semibold text-foreground">
                    {item.start_date || "-"} - {item.end_date || "-"}
                  </Text>
                  <View className={`rounded-full px-2.5 py-1 ${badgeClass.container}`}>
                    <Text className={`text-xs font-semibold ${badgeClass.text}`}>
                      {statusLabel(item.status)}
                    </Text>
                  </View>
                </View>
                <Text variant="muted" className="text-sm">
                  Jenis: {item.note || "Izin/Cuti"}
                </Text>
                <Text variant="muted" className="text-sm mt-1">
                  Alasan: {item.reason}
                </Text>
              </View>
            );
          }}
        />
      </View>

      <View
        className="absolute left-4 right-4"
        style={{ bottom: insets.bottom + 12 }}
      >
        <Button onPress={openCreateSheet}>
          <Text className="text-primary-foreground font-bold">Buat Pengajuan</Text>
        </Button>
      </View>

      <BottomSheetModal
        ref={createSheetRef}
        snapPoints={createSheetSnapPoints}
        enablePanDownToClose
        onDismiss={handleDismissCreateSheet}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
          />
        )}
        backgroundStyle={{
          backgroundColor: Colors[colorScheme ?? "light"].background,
        }}
        handleIndicatorStyle={{
          backgroundColor: Colors[colorScheme ?? "light"].icon,
        }}
        keyboardBehavior="extend"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
      >
        <BottomSheetView className="flex-1 px-6 pt-2">
          <BottomSheetScrollView
            className="flex-1"
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
          >
            <Text className="text-lg font-semibold text-foreground">
              Form Pengajuan Izin/Cuti
            </Text>
            <Text variant="muted" className="mt-1">
              Isi jenis, tanggal, dan alasan pengajuan.
            </Text>

            <View className="mt-4">
              <Text className="text-sm font-medium text-foreground mb-2">Jenis</Text>
              <View className="flex-row flex-wrap gap-2">
                {LEAVE_TYPE_OPTIONS.map((item) => (
                  <Pressable
                    key={item}
                    onPress={() => setType(item)}
                    className={`px-4 py-2 rounded-full border ${
                      type === item
                        ? "bg-primary border-primary"
                        : "bg-background border-border"
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        type === item ? "text-primary-foreground" : "text-foreground"
                      }`}
                    >
                      {item}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="mt-4 gap-3">
              <View>
                <Text className="text-sm font-medium text-foreground mb-2">Tanggal Mulai</Text>
                <BottomSheetTextInput
                  value={startDate}
                  onChangeText={setStartDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={Colors[colorScheme ?? "light"].icon}
                  className="border border-border rounded-lg px-4 py-3 text-foreground bg-background"
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-foreground mb-2">Tanggal Selesai</Text>
                <BottomSheetTextInput
                  value={endDate}
                  onChangeText={setEndDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={Colors[colorScheme ?? "light"].icon}
                  className="border border-border rounded-lg px-4 py-3 text-foreground bg-background"
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-foreground mb-2">Alasan</Text>
                <BottomSheetTextInput
                  value={reason}
                  onChangeText={setReason}
                  placeholder="Jelaskan alasan pengajuan..."
                  placeholderTextColor={Colors[colorScheme ?? "light"].icon}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  className="border border-border rounded-lg px-4 py-3 text-foreground bg-background h-28"
                />
              </View>
            </View>

            <View className="flex-row gap-3 mt-5">
              <Button
                variant="outline"
                className="flex-1"
                onPress={closeCreateSheet}
                disabled={isSubmitting}
              >
                <Text className="font-semibold">Batal</Text>
              </Button>
              <Button className="flex-1" onPress={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-primary-foreground font-bold">Kirim</Text>
                )}
              </Button>
            </View>
          </BottomSheetScrollView>
        </BottomSheetView>
      </BottomSheetModal>
    </SafeAreaView>
  );
}
