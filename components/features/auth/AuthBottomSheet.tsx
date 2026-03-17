import { Button } from "@/components/ui/Button";
import {
  SheetHeader,
  SheetModal,
  SheetScrollView,
  SheetView,
} from "@/components/ui/BottomSheet";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Label } from "@/components/ui/label";
import { SheetTextInput } from "@/components/ui/SheetTextInput";
import { Text } from "@/components/ui/text";
import { useAuthBottomSheet } from "@/store/useAuthBottomSheet";
import { useAuthStore } from "@/store/useAuthStore";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Keyboard, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

export function AuthBottomSheet() {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const { isOpen, close, executeCallback } = useAuthBottomSheet();
  const signIn = useAuthStore((s) => s.signIn);
  const insets = useSafeAreaInsets();

  const snapPoints = useMemo(() => ["60%", "80%"], []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

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
    setIsPasswordVisible(false);
    setErrors([]);
  };

  const normalizeErrorList = (message: string | string[]) =>
    (Array.isArray(message) ? message : message.split("\n"))
      .map((item) => item.trim())
      .filter(Boolean);

  const handleLogin = async () => {
    if (!email || !password) {
      setErrors(["Mohon isi semua field"]);
      return;
    }
    setErrors([]);
    setIsLoading(true);
    try {
      const result = await signIn({ email, password });
      if (result.ok) {
        close();
        executeCallback();
        resetForm();
        return;
      }

      const messageSource =
        result.error.messages ??
        result.error.message ??
        "Login gagal. Coba lagi.";
      setErrors(normalizeErrorList(messageSource));
    } catch {
      setErrors(normalizeErrorList("Login gagal. Coba lagi."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    Keyboard.dismiss();
    close();
    resetForm();
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((current) => !current);
  };

  return (
    <SheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      onDismiss={handleDismiss}
    >
      <SheetView className="flex-1 px-6 pt-2">
        <SheetScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        >
          <SheetHeader
            title="Login untuk melanjutkan"
            description="Masuk ke akun untuk akses fitur"
            className="mb-6"
            onClose={handleDismiss}
          />

          <View className="gap-4">
            <View className="gap-1.5">
              <Label>Email</Label>
              <SheetTextInput
                placeholder="name@mail.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                className="border border-border rounded-lg px-4 py-3 text-foreground bg-background"
              />
            </View>

            <View className="gap-1.5">
              <Label>Password</Label>
              <View className="flex-row items-center border border-border rounded-lg px-4 py-3 bg-background">
                <SheetTextInput
                  placeholder="••••••••"
                  secureTextEntry={!isPasswordVisible}
                  value={password}
                  onChangeText={setPassword}
                  className="flex-1 text-foreground"
                />
                <Pressable
                  onPress={togglePasswordVisibility}
                  accessibilityRole="button"
                  accessibilityLabel={
                    isPasswordVisible ? "Sembunyikan password" : "Tampilkan password"
                  }
                  className="pl-3"
                >
                  <IconSymbol
                    name={isPasswordVisible ? "eye.slash" : "eye"}
                    size={20}
                    color="#71717a"
                  />
                </Pressable>
              </View>
            </View>

            {errors.length > 0 ? (
              <View className="gap-1">
                {errors.map((item, index) => (
                  <Text
                    key={`${item}-${index}`}
                    className="text-destructive text-sm"
                  >
                    {item}
                  </Text>
                ))}
              </View>
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
                <Text className="text-primary-foreground font-bold">
                  Masuk
                </Text>
              )}
            </Button>

            <Text className="text-center text-muted-foreground text-sm mt-2">
              Lupa password? Hubungi Admin
            </Text>
          </View>
        </SheetScrollView>
      </SheetView>
    </SheetModal>
  );
}
