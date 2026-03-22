import { Stack } from "expo-router";

import { AuthRequiredState } from "@/components/features/auth/AuthRequiredState";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function PresensiLayout() {
  const { isAuthenticated } = useRequireAuth();

  if (!isAuthenticated) {
    return (
      <AuthRequiredState
        title="Login dibutuhkan"
        description="Masuk terlebih dulu untuk melakukan presensi, melihat riwayat, dan mengirim pengajuan presensi."
        iconName="clock.fill"
        buttonLabel="Login"
      />
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
