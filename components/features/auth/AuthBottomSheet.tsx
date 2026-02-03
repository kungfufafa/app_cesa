import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthBottomSheet } from "@/store/useAuthBottomSheet";
import { useAuthStore } from "@/store/useAuthStore";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Keyboard, View } from "react-native";

export function AuthBottomSheet() {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const { isOpen, close, executeCallback } = useAuthBottomSheet();
  const signIn = useAuthStore((s) => s.signIn);
  const colorScheme = useColorScheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [isOpen]);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setError("");
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Mohon isi semua field");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      await signIn({ email, password });
      close();
      executeCallback();
      resetForm();
    } catch {
      setError("Email atau password salah");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    Keyboard.dismiss();
    close();
    resetForm();
  };

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={["60%"]}
      enablePanDownToClose
      onDismiss={handleDismiss}
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
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
    >
      <BottomSheetView className="flex-1 px-6 pt-2">
        <View className="items-center mb-6">
          <Text className="text-xl font-semibold text-foreground">
            Login untuk melanjutkan
          </Text>
          <Text className="text-muted-foreground text-center mt-1">
            Masuk ke akun untuk akses fitur
          </Text>
        </View>

        <View className="gap-4">
          <View className="gap-1.5">
            <Label>Email</Label>
            <BottomSheetTextInput
              placeholder="name@work.com"
              placeholderTextColor={Colors[colorScheme ?? "light"].icon}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              className="border border-border rounded-lg px-4 py-3 text-foreground bg-background"
            />
          </View>

          <View className="gap-1.5">
            <Label>Password</Label>
            <BottomSheetTextInput
              placeholder="••••••••"
              placeholderTextColor={Colors[colorScheme ?? "light"].icon}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              className="border border-border rounded-lg px-4 py-3 text-foreground bg-background"
            />
          </View>

          {error ? (
            <Text className="text-destructive text-sm">{error}</Text>
          ) : null}

          <Button
            onPress={handleLogin}
            disabled={isLoading}
            size="lg"
            className="mt-2"
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text className="text-primary-foreground font-bold">Masuk</Text>
            )}
          </Button>

          <Text className="text-center text-muted-foreground text-sm mt-2">
            Lupa password? Hubungi Admin
          </Text>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
