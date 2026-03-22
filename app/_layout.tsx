import "../global.css";
import { ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { View } from "react-native";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { PortalHost } from "@rn-primitives/portal";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/store/useAuthStore";
import { useAuthBottomSheet } from "@/store/useAuthBottomSheet";
import { AuthBottomSheet } from "@/components/features/auth/AuthBottomSheet";
import { RequestBottomSheet } from "@/components/features/request/RequestBottomSheet";
import { Colors } from "@/constants/theme";
import { OfflineBanner } from "@/components/features/network/OfflineBanner";
import { NAV_THEME } from "@/lib/theme";
import { initializeNotificationHandler } from "@/services/presensi/notifications";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Spinner } from "@/components/ui/spinner";

export const unstable_settings = {
  anchor: "(tabs)",
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false, // Not needed for mobile
    },
  },
});

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authNotice = useAuthStore((s) => s.authNotice);
  const restoreSession = useAuthStore((s) => s.restoreSession);
  const openAuthSheet = useAuthBottomSheet((s) => s.open);
  const previousIsAuthenticatedRef = useRef(false);
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    restoreSession().catch((e) => {
      if (__DEV__) console.warn("Failed to restore session", e);
    });
    initializeNotificationHandler();
  }, [restoreSession]);

  useEffect(() => {
    if (authNotice && !isAuthenticated) {
      openAuthSheet();
    }
  }, [authNotice, isAuthenticated, openAuthSheet]);

  useEffect(() => {
    const wasAuthenticated = previousIsAuthenticatedRef.current;
    if (wasAuthenticated && !isAuthenticated) {
      queryClient.clear();
    }

    previousIsAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated]);

  if (!fontsLoaded || isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Spinner
          size="large"
          color={Colors[colorScheme ?? "light"].tint}
        />
      </View>
    );
  }

  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? "light"]}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <GestureHandlerRootView className="flex-1">
          <BottomSheetModalProvider>
            <RootLayoutNav />
            <OfflineBanner />
            <AuthBottomSheet />
            <RequestBottomSheet />
            <PortalHost />
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}
