import { Button } from "@/components/ui/Button";
import NetInfo from "@react-native-community/netinfo";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Text } from "@/components/ui/text";
import {
  useAttendanceToday,
  useSchedule,
} from "@/hooks/presensi/usePresensiQueries";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { Camera } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Platform, Pressable, StatusBar, View } from "react-native";
import MapView, {
  Circle,
  Marker,
  PROVIDER_DEFAULT,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

dayjs.locale("id");

function getDistanceFromLatLonInM(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d * 1000;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

const isOfflineState = (
  isConnected: boolean | null,
  isInternetReachable: boolean | null
) => isConnected === false || isInternetReachable === false;

export default function LocationCheckScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { type } = useLocalSearchParams<{ type: "clock_in" | "clock_out" }>();
  const title = type === "clock_out" ? "Pulang" : "Masuk";
  const { data: todayAttendance, isLoading: isLoadingToday } = useAttendanceToday();
  const { data: schedule, isLoading: isFetchingSchedule } = useSchedule();

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(false);
  const [isRefreshingLocation, setIsRefreshingLocation] = useState(false);
  const [showRefreshSuccess, setShowRefreshSuccess] = useState(false);
  const refreshBannerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showRefreshSuccessBanner = () => {
    if (refreshBannerTimerRef.current) {
      clearTimeout(refreshBannerTimerRef.current);
    }

    setShowRefreshSuccess(true);
    refreshBannerTimerRef.current = setTimeout(() => {
      setShowRefreshSuccess(false);
      refreshBannerTimerRef.current = null;
    }, 1800);
  };

  useEffect(() => {
    return () => {
      if (refreshBannerTimerRef.current) {
        clearTimeout(refreshBannerTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    let subscription: Location.LocationSubscription | null = null;
    let didCleanup = false;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted" || !isMounted) {
          if (isMounted) {
            Alert.alert(
              "Izin Lokasi Diperlukan",
              "Akses lokasi wajib diaktifkan untuk melanjutkan proses presensi."
            );
          }
          return;
        }

        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        if (!isMounted) return;
        setLocation(current);

        const sub = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000,
            distanceInterval: 5,
          },
          (newLoc) => {
            if (isMounted) setLocation(newLoc);
          }
        );

        if (didCleanup) {
          sub.remove();
        } else {
          subscription = sub;
        }
      } catch (e) {
        if (isMounted) {
          Alert.alert("Error", "Gagal mendapatkan lokasi. Pastikan GPS aktif.");
        }
      }
    })();

    return () => {
      isMounted = false;
      didCleanup = true;
      subscription?.remove();
    };
  }, []);

  useEffect(() => {
    if (location && schedule?.office) {
      const dist = getDistanceFromLatLonInM(
        location.coords.latitude,
        location.coords.longitude,
        schedule.office.latitude,
        schedule.office.longitude
      );
      setDistance(Number.isFinite(dist) ? dist : null);
      return;
    }

    setDistance(null);
  }, [location, schedule]);

  const canProceed = useMemo(() => {
    if (!schedule) return false;
    if (schedule.is_wfa) return true;
    if (distance === null) return false;
    return distance <= schedule.office.radius;
  }, [distance, schedule]);

  const ensureAttendancePermissions = async () => {
    try {
      setIsCheckingPermissions(true);

      const currentCameraPermission = await Camera.getCameraPermissionsAsync();
      const cameraPermission = currentCameraPermission.granted
        ? currentCameraPermission
        : await Camera.requestCameraPermissionsAsync();

      const currentLocationPermission =
        await Location.getForegroundPermissionsAsync();
      const locationPermission = currentLocationPermission.granted
        ? currentLocationPermission
        : await Location.requestForegroundPermissionsAsync();

      const hasAllPermissions =
        cameraPermission.granted && locationPermission.granted;

      if (!hasAllPermissions) {
        Alert.alert(
          "Izin Diperlukan",
          "Presensi membutuhkan akses Kamera dan Lokasi. Aktifkan keduanya untuk melanjutkan."
        );
      }

      return hasAllPermissions;
    } catch {
      Alert.alert("Error", "Gagal memeriksa izin perangkat. Coba lagi.");
      return false;
    } finally {
      setIsCheckingPermissions(false);
    }
  };

  const handleNext = async () => {
    const netState = await NetInfo.fetch();
    if (isOfflineState(netState.isConnected, netState.isInternetReachable)) {
      Alert.alert(
        "Koneksi Internet Diperlukan",
        "Pastikan internet aktif terlebih dahulu sebelum melanjutkan ke kamera."
      );
      return;
    }

    if (type === "clock_out") {
      if (isLoadingToday) {
        Alert.alert("Mohon Tunggu", "Data presensi hari ini masih dimuat.");
        return;
      }

      if (!todayAttendance?.check_in_time) {
        Alert.alert(
          "Belum Bisa Pulang",
          "Anda belum melakukan Masuk hari ini, jadi belum dapat melakukan Pulang."
        );
        return;
      }
    }

    if (isFetchingSchedule || !schedule) {
      Alert.alert("Validasi Lokasi", "Data lokasi kantor belum siap. Coba lagi.");
      return;
    }

    if (!canProceed) {
      if (schedule.is_wfa) {
        Alert.alert("Validasi Lokasi", "Menunggu pembacaan lokasi. Coba lagi.");
      } else {
        Alert.alert(
          "Di Luar Area Presensi",
          `Anda harus berada dalam radius ${schedule.office.radius} meter dari kantor.`
        );
      }
      return;
    }

    const hasAllPermissions = await ensureAttendancePermissions();
    if (!hasAllPermissions) return;

    router.push({
      pathname: "/presensi/camera",
      params: { type },
    } as never);
  };

  const refreshLocation = async () => {
    setIsRefreshingLocation(true);
    try {
      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(current);
      showRefreshSuccessBanner();
    } catch {
      Alert.alert("Error", "Gagal memperbarui lokasi");
    } finally {
      setIsRefreshingLocation(false);
    }
  };

  const fallbackLatitude =
    location?.coords.latitude ?? schedule?.office.latitude ?? -6.2;
  const fallbackLongitude =
    location?.coords.longitude ?? schedule?.office.longitude ?? 106.816666;

  const handleOpenInfo = () => {
    Alert.alert(
      "Info Validasi Lokasi",
      [
        "Sistem mengecek jarak Anda ke titik kantor yang terdaftar.",
        "",
        "Jika Anda sudah di lokasi tapi belum valid:",
        "1. Pastikan internet aktif dan stabil.",
        "2. Gunakan tombol refresh lokasi (ikon panah) di kanan atas.",
        "3. Pindah ke area terbuka agar sinyal GPS lebih akurat.",
        "4. Aktifkan mode lokasi akurasi tinggi/precise location.",
        "5. Pastikan GPS perangkat aktif.",
        "6. Tunggu 10-20 detik lalu coba lagi.",
      ].join("\n"),
      [{ text: "Mengerti", style: "default" }]
    );
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="light-content" />

      <MapView
        style={{ width: "100%", height: "100%" }}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
        showsUserLocation
        initialRegion={{
          latitude: fallbackLatitude,
          longitude: fallbackLongitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        region={
          location
            ? {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }
            : undefined
        }
      >
        {schedule?.office ? (
          <>
            <Marker
              coordinate={{
                latitude: schedule.office.latitude,
                longitude: schedule.office.longitude,
              }}
              title={schedule.office.name}
            />

            {!schedule.is_wfa ? (
              <Circle
                center={{
                  latitude: schedule.office.latitude,
                  longitude: schedule.office.longitude,
                }}
                radius={schedule.office.radius}
                fillColor="rgba(37,99,235,0.14)"
                strokeColor="rgba(37,99,235,0.45)"
                strokeWidth={1}
              />
            ) : null}
          </>
        ) : null}
      </MapView>

      <LinearGradient
        colors={["#3b82f6", "#60a5fa", "#93c5fd"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute top-0 left-0 right-0 px-4"
        style={{ paddingTop: insets.top, paddingBottom: 14 }}
      >
        <View className="flex-row items-center justify-between">
          <Pressable
            className="w-9 h-9 rounded-full bg-white/20 items-center justify-center"
            onPress={() => router.back()}
            hitSlop={8}
          >
            <IconSymbol name="chevron.left" size={20} color="#fff" />
          </Pressable>

          <View className="items-center">
            <Text className="text-white text-base font-semibold">{title}</Text>
            <Text className="text-white/80 text-xs">Step 1 of 2</Text>
          </View>

          <Pressable
            className="w-9 h-9 rounded-full bg-white/20 items-center justify-center"
            onPress={refreshLocation}
            disabled={isRefreshingLocation}
            hitSlop={8}
          >
            {isRefreshingLocation ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <IconSymbol name="arrow.clockwise" size={18} color="#fff" />
            )}
          </Pressable>
        </View>
      </LinearGradient>

      {showRefreshSuccess ? (
        <View
          pointerEvents="none"
          className="absolute left-0 right-0 z-40 px-4"
          style={{ top: insets.top + 66 }}
        >
          <View className="bg-emerald-600 rounded-full py-2 px-4 items-center shadow-sm self-center">
            <Text className="text-white text-xs font-medium">
              Lokasi berhasil diperbarui
            </Text>
          </View>
        </View>
      ) : null}

      <View
        className="absolute left-4 right-4"
        style={{ bottom: insets.bottom + 18 }}
      >
        <Button
          onPress={handleNext}
          disabled={isCheckingPermissions}
          size="lg"
          className="h-14 rounded-2xl shadow-xl"
        >
          {isCheckingPermissions ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-primary-foreground font-bold">Lanjut ke Kamera</Text>
          )}
        </Button>
      </View>

      <Pressable
        className="absolute right-4 w-11 h-11 rounded-full bg-card border border-border items-center justify-center shadow-lg"
        style={{ bottom: insets.bottom + 92 }}
        onPress={handleOpenInfo}
        hitSlop={8}
      >
        <IconSymbol name="info.circle.fill" size={22} color="#2563eb" />
      </Pressable>
    </View>
  );
}
