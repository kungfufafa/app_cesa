import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import {
    PresensiHariIniResponse,
    ScheduleResponse,
} from "@/services/presensi/presensi";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, View } from "react-native";
import { usePresensiPermissions } from "@/hooks/usePresensiPermissions";

interface PresensiActionCardProps {
    schedule: ScheduleResponse | null;
    isLoading: boolean;
    presensiHariIni: PresensiHariIniResponse | null;
    isLoadingPresensiHariIni: boolean;
    className?: string;
}

export function PresensiActionCard({
    schedule,
    isLoading,
    presensiHariIni,
    isLoadingPresensiHariIni,
    className,
}: PresensiActionCardProps) {
    const router = useRouter();
    const { ensurePermissions, isChecking: isCheckingPermissions } = usePresensiPermissions();

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
        const hasAllPermissions = await ensurePermissions();
        if (!hasAllPermissions) return;

        router.push({
            pathname: "/presensi/location-check",
            params: { type: "clock_in" }
        } as never);
    };

    const handleClockOut = async () => {
        if (isLoadingPresensiHariIni) {
            Alert.alert("Mohon Tunggu", "Data presensi hari ini masih dimuat.");
            return;
        }

        if (!presensiHariIni?.check_in_time) {
            Alert.alert(
                "Belum Bisa Pulang",
                "Anda belum melakukan Masuk hari ini, jadi belum dapat melakukan Pulang."
            );
            return;
        }

        const hasAllPermissions = await ensurePermissions();
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
