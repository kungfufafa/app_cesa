import { Button } from "@/components/ui/Button";
import {
  SheetHeader,
  SheetModal,
  SheetScrollView,
  SheetView,
} from "@/components/ui/BottomSheet";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { SheetTextInput } from "@/components/ui/SheetTextInput";
import { Text } from "@/components/ui/text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useOvertimeList, useSubmitOvertime } from "@/hooks/presensi/usePresensiQueries";
import { normalizeApiError } from "@/lib/api-errors";
import {
  pickRequestAttachment,
  type SelectedRequestAttachment,
  toRequestAttachment,
} from "@/lib/request-attachment";
import { getStatusBadgeClasses, getStatusLabel } from "@/lib/status-helpers";
import { formatTimeString } from "@/lib/dates";
import { Stack } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

export default function OvertimeRequestScreen() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const createSheetRef = useRef<BottomSheetModal>(null);
  const createSheetSnapPoints = useMemo(() => ["75%", "90%"], []);

  const {
    data: overtimeList = [],
    isLoading: isLoadingList,
    isError: hasLoadError,
    isRefetching: isRefreshingList,
    refetch,
  } = useOvertimeList();
  const submitMutation = useSubmitOvertime();

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reason, setReason] = useState("");
  const [selectedFile, setSelectedFile] = useState<SelectedRequestAttachment | null>(null);
  const isSubmitting = submitMutation.isPending;

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
    setSelectedFile(null);
  };

  const handleSelectFile = async () => {
    try {
      setSelectedFile(await pickRequestAttachment());
    } catch {
      Alert.alert("Kesalahan", "Gagal memilih file");
    }
  };

  const handleSubmit = async () => {
    if (!date.trim() || !startTime.trim() || !endTime.trim() || !reason.trim()) {
      Alert.alert("Input Tidak Lengkap", "Mohon lengkapi tanggal, jam, dan alasan lembur.");
      return;
    }

    try {
      await submitMutation.mutateAsync({
        date: date.trim(),
        start_time: startTime.trim(),
        end_time: endTime.trim(),
        reason: reason.trim(),
        file: toRequestAttachment(selectedFile),
      });

      createSheetRef.current?.dismiss();
      Alert.alert("Sukses", "Pengajuan lembur berhasil dikirim.");
    } catch (error) {
      Alert.alert("Gagal", normalizeApiError(error));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScreenHeader title="Pengajuan Lembur" />

      <View className="flex-1 px-4 pt-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-bold">Riwayat Pengajuan</Text>
          <TouchableOpacity
            onPress={() => void refetch()}
            disabled={isRefreshingList}
            className="px-3 py-1.5 rounded-lg bg-secondary border border-border"
            activeOpacity={0.75}
          >
            {isRefreshingList ? (
              <ActivityIndicator size="small" />
            ) : (
              <Text variant="muted" className="text-xs font-semibold">
                Muat Ulang
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
            const badgeClass = getStatusBadgeClasses(item.status);

            return (
              <View className="rounded-xl border border-border bg-card p-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="font-semibold text-foreground">{item.date}</Text>
                  <View className={`rounded-full px-2.5 py-1 ${badgeClass.container}`}>
                    <Text className={`text-xs font-semibold ${badgeClass.text}`}>
                      {getStatusLabel(item.status)}
                    </Text>
                  </View>
                </View>
                <Text variant="muted" className="text-sm">
                  Jam: {formatTimeString(item.start_time)} - {formatTimeString(item.end_time)}
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

      <SheetModal
        ref={createSheetRef}
        snapPoints={createSheetSnapPoints}
        onDismiss={handleDismissCreateSheet}
      >
        <SheetView className="flex-1 px-6 pt-2">
          <SheetScrollView
            className="flex-1"
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
          >
            <SheetHeader
              title="Form Pengajuan Lembur"
              description="Isi data lembur Anda lalu kirim."
              className="mb-4"
              onClose={closeCreateSheet}
            />

            <View className="gap-3">
              <View>
                <Text className="text-sm font-medium text-foreground mb-2">Tanggal</Text>
                <SheetTextInput
                  value={date}
                  onChangeText={setDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={Colors[colorScheme ?? "light"].icon}
                  className="border border-border rounded-lg px-4 py-3 text-foreground bg-background"
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-foreground mb-2">Jam Mulai</Text>
                <SheetTextInput
                  value={startTime}
                  onChangeText={setStartTime}
                  placeholder="HH:mm"
                  placeholderTextColor={Colors[colorScheme ?? "light"].icon}
                  className="border border-border rounded-lg px-4 py-3 text-foreground bg-background"
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-foreground mb-2">Jam Selesai</Text>
                <SheetTextInput
                  value={endTime}
                  onChangeText={setEndTime}
                  placeholder="HH:mm"
                  placeholderTextColor={Colors[colorScheme ?? "light"].icon}
                  className="border border-border rounded-lg px-4 py-3 text-foreground bg-background"
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-foreground mb-2">Alasan</Text>
                <SheetTextInput
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

              <View>
                <Text className="text-sm font-medium text-foreground mb-2">
                  Lampiran (Opsional)
                </Text>
                <Pressable
                  onPress={handleSelectFile}
                  className="border border-dashed border-border rounded-lg px-4 py-4 items-center justify-center bg-secondary/50"
                >
                  {selectedFile ? (
                    <View className="items-center">
                      <IconSymbol name="doc.text.fill" size={24} color="#3b82f6" />
                      <Text className="text-sm font-medium mt-2 text-center" numberOfLines={1}>
                        {selectedFile.name}
                      </Text>
                      <Text className="text-xs text-muted-foreground mt-1">
                        Tap untuk ganti
                      </Text>
                    </View>
                  ) : (
                    <View className="items-center">
                      <IconSymbol name="plus.circle" size={24} color="#9ca3af" />
                      <Text className="text-sm text-muted-foreground mt-2">
                        Pilih File (PDF/Gambar)
                      </Text>
                    </View>
                  )}
                </Pressable>
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
          </SheetScrollView>
        </SheetView>
      </SheetModal>
    </SafeAreaView>
  );
}
