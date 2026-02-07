import { Button } from "@/components/ui/Button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Text } from "@/components/ui/text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  getOvertimes,
  OvertimeItem,
  submitOvertime,
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
import { Stack, useRouter } from "expo-router";
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

function formatTime(value: string | null | undefined): string {
  if (!value) return "--:--";
  return value.slice(0, 5);
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

export default function OvertimeRequestScreen() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const createSheetRef = useRef<BottomSheetModal>(null);
  const createSheetSnapPoints = useMemo(() => ["65%", "82%"], []);

  const [overtimeList, setOvertimeList] = useState<OvertimeItem[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isRefreshingList, setIsRefreshingList] = useState(false);
  const [hasLoadError, setHasLoadError] = useState(false);

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadOvertimes = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshingList(true);
    } else {
      setIsLoadingList(true);
    }

    try {
      const items = await getOvertimes();
      setOvertimeList(items);
      setHasLoadError(false);
    } catch {
      if (!isRefresh) {
        setOvertimeList([]);
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
    void loadOvertimes();
  }, [loadOvertimes]);

  const openCreateSheet = () => {
    createSheetRef.current?.present();
  };

  const closeCreateSheet = () => {
    if (isSubmitting) return;
    createSheetRef.current?.dismiss();
  };

  const handleDismissCreateSheet = () => {
    if (isSubmitting) return;
    setDate("");
    setStartTime("");
    setEndTime("");
    setReason("");
  };

  const handleSubmit = async () => {
    if (!date.trim() || !startTime.trim() || !endTime.trim() || !reason.trim()) {
      Alert.alert("Input Tidak Lengkap", "Mohon lengkapi tanggal, jam, dan alasan lembur.");
      return;
    }

    try {
      setIsSubmitting(true);
      await submitOvertime({
        date: date.trim(),
        start_time: startTime.trim(),
        end_time: endTime.trim(),
        reason: reason.trim(),
      });

      createSheetRef.current?.dismiss();
      Alert.alert("Sukses", "Pengajuan lembur berhasil dikirim.");
      await loadOvertimes(true);
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
            <Text className="text-white text-base font-semibold">Pengajuan Lembur</Text>
          </View>
          <View className="w-9 h-9" />
        </View>
      </LinearGradient>

      <View className="flex-1 px-4 pt-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-bold">Riwayat Pengajuan</Text>
          <TouchableOpacity
            onPress={() => void loadOvertimes(true)}
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
          data={overtimeList}
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
                  ? "Riwayat lembur belum dapat dimuat."
                  : "Belum ada pengajuan lembur."}
              </Text>
            )
          }
          renderItem={({ item }) => {
            const badgeClass = statusBadgeClass(item.status);

            return (
              <View className="rounded-xl border border-border bg-card p-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="font-semibold text-foreground">{item.date}</Text>
                  <View className={`rounded-full px-2.5 py-1 ${badgeClass.container}`}>
                    <Text className={`text-xs font-semibold ${badgeClass.text}`}>
                      {statusLabel(item.status)}
                    </Text>
                  </View>
                </View>
                <Text variant="muted" className="text-sm">
                  Jam: {formatTime(item.start_time)} - {formatTime(item.end_time)}
                </Text>
                <Text variant="muted" className="text-sm mt-1">
                  Alasan: {item.reason}
                </Text>
                {item.note ? (
                  <Text variant="muted" className="text-xs mt-2">
                    Catatan Admin: {item.note}
                  </Text>
                ) : null}
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
            <Text className="text-lg font-semibold text-foreground">Form Pengajuan Lembur</Text>
            <Text variant="muted" className="mt-1">
              Isi data lembur Anda lalu kirim.
            </Text>

            <View className="mt-4 gap-3">
              <View>
                <Text className="text-sm font-medium text-foreground mb-2">Tanggal</Text>
                <BottomSheetTextInput
                  value={date}
                  onChangeText={setDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={Colors[colorScheme ?? "light"].icon}
                  className="border border-border rounded-lg px-4 py-3 text-foreground bg-background"
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-foreground mb-2">Jam Mulai</Text>
                <BottomSheetTextInput
                  value={startTime}
                  onChangeText={setStartTime}
                  placeholder="HH:mm"
                  placeholderTextColor={Colors[colorScheme ?? "light"].icon}
                  className="border border-border rounded-lg px-4 py-3 text-foreground bg-background"
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-foreground mb-2">Jam Selesai</Text>
                <BottomSheetTextInput
                  value={endTime}
                  onChangeText={setEndTime}
                  placeholder="HH:mm"
                  placeholderTextColor={Colors[colorScheme ?? "light"].icon}
                  className="border border-border rounded-lg px-4 py-3 text-foreground bg-background"
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-foreground mb-2">Alasan</Text>
                <BottomSheetTextInput
                  value={reason}
                  onChangeText={setReason}
                  placeholder="Jelaskan alasan lembur..."
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
