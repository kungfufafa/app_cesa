import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import {
    AttendanceTodayResponse,
    ScheduleResponse,
} from "@/services/presensi/attendance";
import { Camera } from "expo-camera";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, View } from "react-native";

interface AttendanceActionCardProps {
    schedule: ScheduleResponse | null;
    isLoading: boolean;
    todayAttendance: AttendanceTodayResponse | null;
    isLoadingToday: boolean;
    className?: string;
}

export function AttendanceActionCard({
    schedule,
    isLoading,
    todayAttendance,
    isLoadingToday,
    className,
}: AttendanceActionCardProps) {
    const router = useRouter();
    const [isCheckingPermissions, setIsCheckingPermissions] = useState(false);

    const ensureAttendancePermissions = async () => {
        try {
            setIsCheckingPermissions(true);

            const currentCameraPermission = await Camera.getCameraPermissionsAsync();
            const cameraPermission = currentCameraPermission.granted
                ? currentCameraPermission
                : await Camera.requestCameraPermissionsAsync();

            const currentLocationPermission = await Location.getForegroundPermissionsAsync();
            const locationPermission = currentLocationPermission.granted
                ? currentLocationPermission
                : await Location.requestForegroundPermissionsAsync();

            const hasAllPermissions = cameraPermission.granted && locationPermission.granted;

            if (!hasAllPermissions) {
                Alert.alert(
                    "Izin Diperlukan",
                    "Presensi membutuhkan akses Kamera dan Lokasi. Aktifkan keduanya untuk melanjutkan Masuk/Pulang."
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

    if (isLoading) {
        return (
            <Card className={cn("border-0 shadow-lg", className)}>
                <CardContent className="p-6">
                    <View className="items-center mb-6">
                        <Skeleton className="w-32 h-4 rounded mb-2" />
                        <Skeleton className="w-48 h-8 rounded mb-2" />
                        <Skeleton className="w-40 h-6 rounded" />
                    </View>
                    <View className="flex-row gap-3">
                        <Skeleton className="flex-1 h-12 rounded-lg" />
                        <Skeleton className="flex-1 h-12 rounded-lg" />
                    </View>
                </CardContent>
            </Card>
        );
    }

    const handleClockIn = async () => {
        const hasAllPermissions = await ensureAttendancePermissions();
        if (!hasAllPermissions) return;

        router.push({
            pathname: "/presensi/location-check",
            params: { type: "clock_in" }
        } as never);
    };

    const handleClockOut = async () => {
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

        const hasAllPermissions = await ensureAttendancePermissions();
        if (!hasAllPermissions) return;

        router.push({
            pathname: "/presensi/location-check",
            params: { type: "clock_out" }
        } as never);
    };

    return (
        <Card className={cn("border-border py-0", className)}>
            <CardContent className="p-5">
                <View className="items-center mb-6">
                    {schedule ? (
                        <>
                            <Text className="text-lg font-bold text-foreground mb-1">
                                {schedule.shift.name}
                            </Text>
                            <Text className="text-3xl font-extrabold text-foreground mb-2">
                                {schedule.shift.start_time?.slice(0, 5)} - {schedule.shift.end_time?.slice(0, 5)}
                            </Text>
                            <View className="flex-row items-center mb-4">
                                <Text className="text-primary text-sm font-medium">
                                    Lokasi: {schedule.office.name}
                                </Text>
                            </View>
                        </>
                    ) : (
                        <Text className="text-lg font-bold text-foreground mb-4">
                            Tidak ada jadwal hari ini
                        </Text>
                    )}

                    <View className="w-full bg-secondary rounded-lg py-2 px-3 flex-row items-center justify-center border border-border mb-2">
                        <IconSymbol name="info.circle.fill" size={16} color="#6b7280" />
                        <Text className="text-xs text-muted-foreground ml-2">
                            Foto selfie wajib untuk proses Masuk/Pulang
                        </Text>
                    </View>
                </View>

                <View className="flex-row gap-3">
                    <Button
                        className="flex-1 bg-primary"
                        onPress={handleClockIn}
                        size="lg"
                        disabled={isCheckingPermissions}
                    >
                        <Text className="text-white font-bold">Masuk</Text>
                    </Button>
                    <Button
                        className="flex-1 bg-primary"
                        onPress={handleClockOut}
                        size="lg"
                        disabled={isCheckingPermissions}
                    >
                        <Text className="text-white font-bold">Pulang</Text>
                    </Button>
                </View>
            </CardContent>
        </Card>
    );
}
