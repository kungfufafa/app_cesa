import * as Notifications from "expo-notifications";
import dayjs from "dayjs";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import {
  AttendanceTodayResponse,
  ScheduleResponse,
} from "@/services/presensi/attendance";

const ATTENDANCE_REMINDER_CHANNEL_ID = "attendance-reminders";
const ATTENDANCE_REMINDER_SOURCE = "attendance-reminder";
const ATTENDANCE_REMINDER_MINUTES_STORAGE_KEY =
  "attendance_reminder_minutes_before";

export const ATTENDANCE_REMINDER_MINUTES_BEFORE = 15;
export const ATTENDANCE_REMINDER_MINUTES_MIN = 1;
export const ATTENDANCE_REMINDER_MINUTES_MAX = 180;

let notificationHandlerInitialized = false;

function normalizeReminderMinutes(value: number): number {
  if (!Number.isFinite(value)) {
    return ATTENDANCE_REMINDER_MINUTES_BEFORE;
  }

  const rounded = Math.round(value);
  return Math.max(
    ATTENDANCE_REMINDER_MINUTES_MIN,
    Math.min(ATTENDANCE_REMINDER_MINUTES_MAX, rounded)
  );
}

function hasGrantedNotificationPermission(
  status: Notifications.NotificationPermissionsStatus
): boolean {
  if (status.granted) return true;

  return (
    status.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}

function buildTriggerDate(
  timeValue: string | null | undefined,
  minutesBefore: number
): Date | null {
  if (!timeValue) return null;

  const [hourPart, minutePart] = timeValue.split(":");
  const hour = Number(hourPart);
  const minute = Number(minutePart);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return null;
  }

  const triggerDate = dayjs()
    .hour(hour)
    .minute(minute)
    .second(0)
    .millisecond(0)
    .subtract(minutesBefore, "minute");

  if (!triggerDate.isValid()) {
    return null;
  }

  if (triggerDate.isBefore(dayjs().add(20, "second"))) {
    return null;
  }

  return triggerDate.toDate();
}

function isAttendanceReminder(
  item: Notifications.NotificationRequest
): boolean {
  const source = item.content.data?.source;
  return source === ATTENDANCE_REMINDER_SOURCE;
}

export function initializeNotificationHandler() {
  if (notificationHandlerInitialized) return;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  notificationHandlerInitialized = true;
}

export async function getReminderMinutesBefore(): Promise<number> {
  const rawValue = await SecureStore.getItemAsync(
    ATTENDANCE_REMINDER_MINUTES_STORAGE_KEY
  );

  if (!rawValue) {
    return ATTENDANCE_REMINDER_MINUTES_BEFORE;
  }

  const parsed = Number(rawValue);
  const normalized = normalizeReminderMinutes(parsed);

  if (String(normalized) !== rawValue) {
    await SecureStore.setItemAsync(
      ATTENDANCE_REMINDER_MINUTES_STORAGE_KEY,
      String(normalized)
    );
  }

  return normalized;
}

export async function setReminderMinutesBefore(
  minutesBefore: number
): Promise<number> {
  const normalized = normalizeReminderMinutes(minutesBefore);
  await SecureStore.setItemAsync(
    ATTENDANCE_REMINDER_MINUTES_STORAGE_KEY,
    String(normalized)
  );
  return normalized;
}

export async function ensureNotificationChannel() {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync(ATTENDANCE_REMINDER_CHANNEL_ID, {
    name: "Pengingat Presensi",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 150, 250],
    lightColor: "#2563EB",
    showBadge: true,
    sound: "default",
  });
}

export async function ensureNotificationPermissions() {
  const existingPermission = await Notifications.getPermissionsAsync();
  if (hasGrantedNotificationPermission(existingPermission)) {
    return true;
  }

  const requestedPermission = await Notifications.requestPermissionsAsync();
  return hasGrantedNotificationPermission(requestedPermission);
}

async function cancelExistingAttendanceReminders() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const reminders = scheduled.filter(isAttendanceReminder);

  await Promise.all(
    reminders.map((item) =>
      Notifications.cancelScheduledNotificationAsync(item.identifier)
    )
  );
}

async function scheduleReminder(params: {
  title: string;
  body: string;
  triggerDate: Date;
  reminderType: "masuk" | "pulang";
}) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: params.title,
      body: params.body,
      sound: "default",
      data: {
        source: ATTENDANCE_REMINDER_SOURCE,
        reminderType: params.reminderType,
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: params.triggerDate,
      channelId:
        Platform.OS === "android"
          ? ATTENDANCE_REMINDER_CHANNEL_ID
          : undefined,
    },
  });
}

export async function syncAttendanceReminderNotifications(
  schedule: ScheduleResponse,
  todayAttendance: AttendanceTodayResponse | null,
  minutesBefore = ATTENDANCE_REMINDER_MINUTES_BEFORE
): Promise<{ permissionGranted: boolean; scheduledCount: number }> {
  initializeNotificationHandler();
  await ensureNotificationChannel();

  const permissionGranted = await ensureNotificationPermissions();
  if (!permissionGranted) {
    return { permissionGranted: false, scheduledCount: 0 };
  }

  await cancelExistingAttendanceReminders();

  const reminders: Array<Promise<void>> = [];

  if (!todayAttendance?.check_in_time) {
    const triggerMasuk = buildTriggerDate(
      schedule.shift.start_time,
      minutesBefore
    );

    if (triggerMasuk) {
      reminders.push(
        scheduleReminder({
          title: "Pengingat Masuk",
          body: `${minutesBefore} menit lagi waktunya Masuk. Jangan lupa presensi.`,
          triggerDate: triggerMasuk,
          reminderType: "masuk",
        })
      );
    }
  }

  if (!todayAttendance?.check_out_time) {
    const triggerPulang = buildTriggerDate(
      schedule.shift.end_time,
      minutesBefore
    );

    if (triggerPulang) {
      reminders.push(
        scheduleReminder({
          title: "Pengingat Pulang",
          body: `${minutesBefore} menit lagi waktunya Pulang. Jangan lupa presensi.`,
          triggerDate: triggerPulang,
          reminderType: "pulang",
        })
      );
    }
  }

  await Promise.all(reminders);

  return { permissionGranted: true, scheduledCount: reminders.length };
}
