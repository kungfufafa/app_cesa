import { Button } from "@/components/ui/Button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Text } from "@/components/ui/text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  getOvertimes,
  OvertimeItem,
  submitOvertime,
} from "@/services/presensi/forms";
import { normalizeApiError } from "@/lib/api-errors";
import { getStatusBadgeClasses, getStatusLabel } from "@/lib/status-helpers";
import { formatTimeString } from "@/lib/dates";
import { createFormData, normalizeMimeType } from "@/lib/form-data";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import * as DocumentPicker from "expo-document-picker";
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

export default function OvertimeRequestScreen() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const createSheetRef = useRef<BottomSheetModal>(null);
  const createSheetSnapPoints = useMemo(() => ["75%", "90%"], []);

  const [overtimeList, setOvertimeList] = useState<OvertimeItem[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isRefreshingList, setIsRefreshingList] = useState(false);
  const [hasLoadError, setHasLoadError] = useState(false);

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reason, setReason] = useState("");
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(
    null
  );
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
    setSelectedFile(null);
  };

  const handleSelectFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      setSelectedFile(result.assets[0]);
    } catch (error) {
      Alert.alert("Error", "Gagal memilih file");
    }
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
        file: selectedFile
          ? {
              uri: selectedFile.uri,
              name: selectedFile.name,
              mimeType: selectedFile.mimeType ?? "application/octet-stream",
            }
          : null,
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

      <ScreenHeader title="Pengajuan Lembur" />

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
          </BottomSheetScrollView>
        </BottomSheetView>
      </BottomSheetModal>
    </SafeAreaView>
  );
}
