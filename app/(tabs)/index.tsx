import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocation, useDistance } from "@/hooks/useAttendance";
import { LiveClock } from "@/components/features/attendance/LiveClock";
import { LocationMap } from "@/components/features/attendance/LocationMap";
import { StatusCard } from "@/components/features/attendance/StatusCard";
import { CameraModal } from "@/components/features/attendance/CameraModal";
import {
  getTodayStatus,
  clockIn,
  clockOut,
  AttendanceStatus,
} from "@/services/attendance";
import { MapPin, Camera } from "lucide-react-native";
import { useAuthStore } from "@/store/useAuthStore";

const OFFICE_LOCATION = {
  latitude: -6.175392,
  longitude: 106.827153,
  radiusMeters: 200,
};

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const { location, errorMsg, requestPermissions } = useLocation();
  const distance = useDistance(
    location?.latitude,
    location?.longitude,
    OFFICE_LOCATION.latitude,
    OFFICE_LOCATION.longitude,
  );

  const [status, setStatus] = useState<AttendanceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const data = await getTodayStatus();
      setStatus(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    requestPermissions();
  }, [fetchStatus, requestPermissions]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStatus();
    requestPermissions();
  }, [fetchStatus, requestPermissions]);

  const handleClockAction = () => {
    if (!location) {
      Alert.alert(
        "Location needed",
        "Please wait for location to be detected.",
      );
      return;
    }

    if (distance === null || distance > OFFICE_LOCATION.radiusMeters) {
      Alert.alert(
        "Out of Range",
        `You are ${Math.round(distance || 0)}m away from office. Must be within ${OFFICE_LOCATION.radiusMeters}m.`,
      );
      return;
    }

    setCameraVisible(true);
  };

  const handleCapture = async (photoBase64: string) => {
    setCameraVisible(false);
    setLoading(true);

    try {
      if (!location) return;

      if (status?.clockedIn) {
        await clockOut({
          latitude: location.latitude,
          longitude: location.longitude,
          photo: photoBase64,
        });
        Alert.alert("Success", "Clocked Out Successfully!");
      } else {
        await clockIn({
          latitude: location.latitude,
          longitude: location.longitude,
          photo: photoBase64,
        });
        Alert.alert("Success", "Clocked In Successfully!");
      }
      await fetchStatus();
    } catch {
      Alert.alert("Error", "Failed to submit attendance.");
    } finally {
      setLoading(false);
    }
  };

  const isWithinRange =
    distance !== null && distance <= OFFICE_LOCATION.radiusMeters;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="p-5 pb-24"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-xl font-semibold text-foreground tracking-tight">
              Good morning, {user?.name?.split(" ")[0] || "User"}
            </Text>
            <Text className="text-sm text-muted-foreground">
              Ready to work today?
            </Text>
          </View>
          <View className="w-10 h-10 rounded-full bg-secondary items-center justify-center border border-border">
            <Text className="text-foreground text-sm font-medium">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </Text>
          </View>
        </View>

        <LiveClock />

        {status && (
          <StatusCard
            clockedIn={status.clockedIn}
            shiftStart={status.shiftStart}
            shiftEnd={status.shiftEnd}
            lastClockIn={status.lastClockIn}
            lastClockOut={status.lastClockOut}
          />
        )}

        <View className="mt-6">
          <View className="flex-row items-center mb-3 justify-between">
            <View className="flex-row items-center gap-2">
              <MapPin
                size={16}
                className="text-muted-foreground"
                color="#a1a1aa"
              />
              <Text className="text-sm font-medium text-foreground">
                Location
              </Text>
            </View>
            {distance !== null && (
              <View
                className={`px-2 py-0.5 rounded-md border ${
                  isWithinRange
                    ? "bg-green-500/10 border-green-500/20"
                    : "bg-red-500/10 border-red-500/20"
                }`}
              >
                <Text
                  className={`text-xs font-medium ${
                    isWithinRange
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {Math.round(distance)}m away
                </Text>
              </View>
            )}
          </View>
          <LocationMap
            officeLatitude={OFFICE_LOCATION.latitude}
            officeLongitude={OFFICE_LOCATION.longitude}
            allowedRadius={OFFICE_LOCATION.radiusMeters}
          />
          {errorMsg && (
            <Text className="text-destructive text-xs mt-2">{errorMsg}</Text>
          )}
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 bg-background/80 p-5 border-t border-border items-center backdrop-blur-md">
        <TouchableOpacity
          className={`w-full h-12 rounded-lg flex-row justify-center items-center border ${
            !isWithinRange || loading || !location
              ? "bg-muted border-transparent"
              : status?.clockedIn
                ? "bg-destructive border-transparent"
                : "bg-primary border-transparent"
          }`}
          onPress={handleClockAction}
          disabled={!isWithinRange || loading || !location}
        >
          <Camera
            size={20}
            color={!isWithinRange || loading || !location ? "#a1a1aa" : "white"}
            className="mr-2"
          />
          <Text
            className={`text-base font-medium ${!isWithinRange || loading || !location ? "text-muted-foreground" : "text-primary-foreground"}`}
          >
            {loading
              ? "Processing..."
              : status?.clockedIn
                ? "Clock Out"
                : "Clock In"}
          </Text>
        </TouchableOpacity>
        {!isWithinRange && location && (
          <Text className="mt-3 text-destructive text-xs font-medium">
            You must be at the office to clock in/out.
          </Text>
        )}
      </View>

      <CameraModal
        visible={cameraVisible}
        onClose={() => setCameraVisible(false)}
        onCapture={handleCapture}
      />
    </SafeAreaView>
  );
}
