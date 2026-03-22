import { Stack } from "expo-router";

import { AuthRequiredState } from "@/components/features/auth/AuthRequiredState";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function HelpdeskLayout() {
  const { isAuthenticated } = useRequireAuth();

  if (!isAuthenticated) {
    return (
      <AuthRequiredState
        title="Login dibutuhkan"
        description="Masuk terlebih dulu untuk membuka detail, membuat, atau mengubah tiket helpdesk."
        iconName="headphones"
        buttonLabel="Login"
      />
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="create" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="[id]/edit" />
    </Stack>
  );
}
