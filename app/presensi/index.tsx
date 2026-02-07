import { AttendanceActionCard } from "@/components/features/presensi/AttendanceActionCard";
import { Button } from "@/components/ui/Button";
import { IconSymbol, type IconSymbolName } from "@/components/ui/icon-symbol";
import { Text } from "@/components/ui/text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { LinearGradient } from "expo-linear-gradient";
import { AttendanceRecord } from "@/services/presensi/attendance";
import {
  ATTENDANCE_REMINDER_MINUTES_BEFORE,
  ATTENDANCE_REMINDER_MINUTES_MAX,
  ATTENDANCE_REMINDER_MINUTES_MIN,
  getReminderMinutesBefore,
  setReminderMinutesBefore,
  syncAttendanceReminderNotifications,
} from "@/services/presensi/notifications";
import {
  useAttendanceToday,
  useSchedule,
  useAttendanceHistory,
} from "@/hooks/presensi/usePresensiQueries";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

dayjs.locale("id");

export default function PresensiDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();

  const currentDate = useMemo(() => dayjs(), []);
  const { data: todayData, isLoading: isLoadingToday } = useAttendanceToday();
  const { data: schedule, isLoading: isLoadingSchedule } = useSchedule();
  const { data: history = [], isLoading: isLoadingHistory } = useAttendanceHistory(
    currentDate.month() + 1,
    currentDate.year()
  );

  const [reminderMinutes, setReminderMinutes] = useState(
    ATTENDANCE_REMINDER_MINUTES_BEFORE
  );
  const [reminderInput, setReminderInput] = useState(
    String(ATTENDANCE_REMINDER_MINUTES_BEFORE)
  );
  const [isLoadingReminderMinutes, setIsLoadingReminderMinutes] = useState(true);
  const [isSavingReminderMinutes, setIsSavingReminderMinutes] = useState(false);
  const hasShownNotificationPermissionAlertRef = useRef(false);
  const reminderSettingsSheetRef = useRef<BottomSheetModal>(null);
  const reminderSettingsSnapPoints = useMemo(() => ["50%", "70%"], []);
  const submissionActions: {
    key: string;
    label: string;
    icon: IconSymbolName;
    onPress: () => void;
  }[] = useMemo(
    () => [
      {
        key: "overtime",
        label: "Lembur",
        icon: "briefcase.fill",
        onPress: () => router.push("/presensi/overtime" as never),
      },
      {
        key: "leave",
        label: "Izin/Cuti",
        icon: "doc.text.fill",
        onPress: () => router.push("/presensi/leave" as never),
      },
      {
        key: "history",
        label: "Riwayat",
        icon: "list.bullet",
        onPress: () => router.push("/presensi/history" as never),
      },
    ],
    [router]
  );

  useEffect(() => {
    let isMounted = true;

    const loadReminderMinutes = async () => {
      try {
        const savedMinutes = await getReminderMinutesBefore();
        if (!isMounted) return;

        setReminderMinutes(savedMinutes);
        setReminderInput(String(savedMinutes));
      } catch (error) {
        if (__DEV__) {
          console.warn("Failed to load reminder minutes", error);
        }
      } finally {
        if (isMounted) {
          setIsLoadingReminderMinutes(false);
        }
      }
    };

    void loadReminderMinutes();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!schedule || isLoadingReminderMinutes) return;

    let isCancelled = false;

    const syncReminders = async () => {
      try {
        const result = await syncAttendanceReminderNotifications(
          schedule,
          todayData ?? null,
          reminderMinutes
        );

        if (
          !isCancelled &&
          !result.permissionGranted &&
          !hasShownNotificationPermissionAlertRef.current
        ) {
          hasShownNotificationPermissionAlertRef.current = true;
          Alert.alert(
            "Izin Notifikasi Diperlukan",
            "Aktifkan notifikasi agar aplikasi bisa mengirim pengingat Masuk dan Pulang."
          );
        }
      } catch (error) {
        if (__DEV__) {
          console.warn("Failed to sync attendance reminders", error);
        }
      }
    };

    void syncReminders();

    return () => {
      isCancelled = true;
    };
  }, [todayData, isLoadingReminderMinutes, reminderMinutes, schedule]);

  const openReminderSettings = () => {
    setReminderInput(String(reminderMinutes));
    reminderSettingsSheetRef.current?.present();
  };

  const closeReminderSettings = () => {
    if (isSavingReminderMinutes) return;
    reminderSettingsSheetRef.current?.dismiss();
  };

  const handleReminderSettingsDismiss = () => {
    setReminderInput(String(reminderMinutes));
  };

  const handleSaveReminderSettings = async () => {
    const parsedMinutes = Number(reminderInput.trim());

    if (!Number.isFinite(parsedMinutes) || !Number.isInteger(parsedMinutes)) {
      Alert.alert(
        "Input Tidak Valid",
        `Masukkan angka ${ATTENDANCE_REMINDER_MINUTES_MIN}-${ATTENDANCE_REMINDER_MINUTES_MAX} menit.`
      );
      return;
    }

    if (
      parsedMinutes < ATTENDANCE_REMINDER_MINUTES_MIN ||
      parsedMinutes > ATTENDANCE_REMINDER_MINUTES_MAX
    ) {
      Alert.alert(
        "Input Tidak Valid",
        `Pengingat hanya bisa diatur antara ${ATTENDANCE_REMINDER_MINUTES_MIN}-${ATTENDANCE_REMINDER_MINUTES_MAX} menit.`
      );
      return;
    }

    try {
      setIsSavingReminderMinutes(true);
      const savedMinutes = await setReminderMinutesBefore(parsedMinutes);
      setReminderMinutes(savedMinutes);
      setReminderInput(String(savedMinutes));
      reminderSettingsSheetRef.current?.dismiss();
    } catch (error) {
      if (__DEV__) {
        console.warn("Failed to save reminder minutes", error);
      }
      Alert.alert("Error", "Gagal menyimpan pengaturan pengingat.");
    } finally {
      setIsSavingReminderMinutes(false);
    }
  };

  const renderItem = ({ item }: { item: AttendanceRecord }) => {
    const dateObj = dayjs(item.date);
    const timeDisplay = item.check_in_time ? item.check_in_time.slice(0, 5) : "--:--";

    return (
      <View className="flex-row items-center py-4 border-b border-border/50">
        <Text className="font-bold text-base w-16">{timeDisplay}</Text>
        <View className="flex-1 px-2">
          <Text className="text-sm font-medium">{dateObj.format("DD MMM")}</Text>
          <Text variant="muted" className="text-xs">
            {item.status}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Text className="text-sm font-medium mr-2">
            {item.check_out_time ? `Pulang: ${item.check_out_time.slice(0, 5)}` : "Belum Pulang"}
          </Text>
          <IconSymbol name="chevron.right" size={16} color="#9ca3af" />
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={["#3b82f6", "#60a5fa", "#93c5fd"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-4 pt-2"
        style={{ paddingTop: insets.top, paddingBottom: 26 }}
      >
        <View className="flex-row items-center justify-between">
          <Pressable
            className="w-9 h-9 rounded-full bg-white/20 items-center justify-center"
            onPress={() => router.back()}
            hitSlop={8}
          >
            <IconSymbol name="chevron.left" size={20} color="#fff" />
          </Pressable>
          <Text className="text-white text-base font-semibold">Presensi</Text>
          <Pressable
            className="w-9 h-9 rounded-full bg-white/20 items-center justify-center"
            onPress={openReminderSettings}
            hitSlop={8}
          >
            <IconSymbol name="gear" size={18} color="#fff" />
          </Pressable>
        </View>

        <View className="mt-5 w-full bg-white/85 rounded-lg py-2 px-3 flex-row items-center justify-center border border-white/70">
          <IconSymbol name="info.circle.fill" size={16} color="#6b7280" />
          <Text className="text-xs text-muted-foreground ml-2">
            Pengingat {reminderMinutes} menit sebelum jam Masuk/Pulang
          </Text>
        </View>

        <AttendanceActionCard
          schedule={schedule ?? null}
          isLoading={isLoadingSchedule}
          todayAttendance={todayData ?? null}
          isLoadingToday={isLoadingToday}
          className="mt-5 mb-0 border-border"
        />
      </LinearGradient>

      <View className="flex-1 bg-background px-4 pt-5">
        <View className="flex-1">
          <View className="flex-row justify-between items-center mb-2 px-2">
            <Text className="text-lg font-bold">Riwayat Presensi</Text>
            <Pressable onPress={() => router.push("/presensi/history" as never)}>
              <Text className="text-primary text-sm font-medium">Lihat Semua</Text>
            </Pressable>
          </View>

          <FlatList
            data={history}
            keyExtractor={(item) => String(item.id || item.date)}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + 88 }}
            ListEmptyComponent={
              !isLoadingHistory ? (
                <View className="items-center justify-center py-10">
                  <Text variant="muted" className="text-center">Belum ada riwayat presensi</Text>
                </View>
              ) : null
            }
          />
        </View>
      </View>

      <View
        className="absolute left-4 right-4 z-20"
        style={{ bottom: insets.bottom + 12 }}
      >
        <View className="flex-row gap-2">
          {submissionActions.map((action) => (
            <Pressable
              key={action.key}
              onPress={action.onPress}
              className="flex-1 flex-row items-center justify-center rounded-full bg-card/95 border border-border/50 px-3 py-2 active:opacity-80"
            >
              <View className="w-7 h-7 rounded-full bg-primary/10 items-center justify-center mr-2">
                <IconSymbol
                  name={action.icon}
                  size={15}
                  color={Colors[colorScheme ?? "light"].tint}
                />
              </View>
              <Text className="text-xs font-semibold">{action.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <BottomSheetModal
        ref={reminderSettingsSheetRef}
        snapPoints={reminderSettingsSnapPoints}
        enablePanDownToClose
        onDismiss={handleReminderSettingsDismiss}
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
              Pengaturan Pengingat
            </Text>
            <Text variant="muted" className="mt-1">
              Atur berapa menit sebelum jam Masuk/Pulang notifikasi dikirim.
            </Text>

            <View className="mt-4">
              <Text className="text-sm font-medium text-foreground mb-2">
                Menit Pengingat
              </Text>
              <BottomSheetTextInput
                value={reminderInput}
                onChangeText={setReminderInput}
                keyboardType="number-pad"
                placeholder={`Contoh: ${ATTENDANCE_REMINDER_MINUTES_BEFORE}`}
                placeholderTextColor={Colors[colorScheme ?? "light"].icon}
                maxLength={3}
                className="border border-border rounded-lg px-4 py-3 text-foreground bg-background"
              />
              <Text variant="muted" className="mt-2 text-xs">
                Rentang: {ATTENDANCE_REMINDER_MINUTES_MIN} -{" "}
                {ATTENDANCE_REMINDER_MINUTES_MAX} menit
              </Text>
            </View>

            <View className="flex-row gap-3 mt-5">
              <Button
                variant="outline"
                className="flex-1"
                onPress={closeReminderSettings}
                disabled={isSavingReminderMinutes}
              >
                <Text className="font-semibold">Batal</Text>
              </Button>
              <Button
                className="flex-1"
                onPress={handleSaveReminderSettings}
                disabled={isSavingReminderMinutes}
              >
                {isSavingReminderMinutes ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-primary-foreground font-bold">
                    Simpan
                  </Text>
                )}
              </Button>
            </View>
          </BottomSheetScrollView>
        </BottomSheetView>
      </BottomSheetModal>
    </View>
  );
}
