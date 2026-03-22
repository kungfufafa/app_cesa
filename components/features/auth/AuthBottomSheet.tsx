import { Button } from "@/components/ui/button";
import {
  SheetBackdrop,
  SheetHeader,
  SheetModal,
  SheetScrollView,
  SheetView,
} from "@/components/ui/bottom-sheet";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Label } from "@/components/ui/label";
import { SheetTextInput } from "@/components/ui/sheet-text-input";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useAuthBottomSheet } from "@/store/useAuthBottomSheet";
import { useAuthStore } from "@/store/useAuthStore";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Keyboard, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BottomSheetModal,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";

export function AuthBottomSheet() {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const { isOpen, close, executeCallback } = useAuthBottomSheet();
  const signIn = useAuthStore((s) => s.signIn);
  const authNotice = useAuthStore((s) => s.authNotice);
  const clearAuthNotice = useAuthStore((s) => s.clearAuthNotice);
  const insets = useSafeAreaInsets();

  const snapPoints = useMemo(
    () => [authNotice ? "78%" : "72%"],
    [authNotice]
  );

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
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password;

    if (!normalizedEmail || !normalizedPassword) {
      setErrors(["Mohon isi semua field"]);
      return;
    }
    setErrors([]);
    setIsLoading(true);
    try {
      const result = await signIn({ email: normalizedEmail, password: normalizedPassword });
      if (result.ok) {
        clearAuthNotice();
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

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <SheetBackdrop
        {...props}
        pressBehavior={isLoading ? "none" : "close"}
      />
    ),
    [isLoading]
  );

  return (
    <SheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose={!isLoading}
      enableHandlePanningGesture={!isLoading}
      enableContentPanningGesture={false}
      enableOverDrag={false}
      keyboardBehavior="interactive"
      backdropComponent={renderBackdrop}
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
            onClose={isLoading ? undefined : handleDismiss}
          />

          <View className="gap-4">
            {authNotice ? (
              <View className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <Text className="text-sm leading-6 text-amber-900">{authNotice}</Text>
              </View>
            ) : null}

            <View className="gap-1.5">
              <Label>Email</Label>
              <SheetTextInput
                placeholder="name@mail.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
                autoComplete="email"
                value={email}
                onChangeText={setEmail}
                className="px-4 py-3"
              />
            </View>

            <View className="gap-1.5">
              <Label>Password</Label>
              <View className="flex-row items-center border border-border rounded-lg px-4 py-3 bg-background">
                <SheetTextInput
                  placeholder="••••••••"
                  secureTextEntry={!isPasswordVisible}
                  autoCorrect={false}
                  textContentType="password"
                  autoComplete="password"
                  value={password}
                  onChangeText={setPassword}
                  className="flex-1"
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
                <Spinner color="#fff" size="small" />
              ) : (
                <Text className="text-primary-foreground font-bold">
                  Masuk
                </Text>
              )}
            </Button>

            <Text className="text-center text-muted-foreground text-sm mt-2">
              Sesi login akan terhubung ke perangkat ini. Untuk reset password, hubungi Admin.
            </Text>

            {authNotice ? (
              <Button
                variant="ghost"
                size="sm"
                onPress={clearAuthNotice}
              >
                <Text className="text-muted-foreground">Tutup pesan</Text>
              </Button>
            ) : null}
          </View>
        </SheetScrollView>
      </SheetView>
    </SheetModal>
  );
}
