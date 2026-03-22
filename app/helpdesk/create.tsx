import React, { useState } from "react";
import { View } from "react-native";
import { Href, Stack, router } from "expo-router";

import { HelpdeskTicketForm } from "@/components/features/helpdesk/HelpdeskTicketForm";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useCreateHelpdeskTicket, useHelpdeskMeta } from "@/hooks/helpdesk/useHelpdeskQueries";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { normalizeApiError } from "@/lib/api-errors";
import { useAuthBottomSheet } from "@/store/useAuthBottomSheet";

export default function CreateHelpdeskScreen() {
  const { isAuthenticated } = useRequireAuth();
  const openSheet = useAuthBottomSheet((s) => s.open);
  const [selectedUnitId, setSelectedUnitId] = useState<number | undefined>();
  const [serverError, setServerError] = useState<string | null>(null);
  const { data: meta, isLoading, error } = useHelpdeskMeta();
  const { data: scopedMeta } = useHelpdeskMeta(selectedUnitId);
  const createTicket = useCreateHelpdeskTicket();

  if (!isAuthenticated) {
    return (
      <View className="flex-1 bg-background justify-center items-center px-6">
        <Stack.Screen options={{ headerShown: false }} />
        <Text className="text-lg font-semibold">Login dibutuhkan</Text>
        <Text className="text-sm text-muted-foreground text-center mt-2">
          Masuk terlebih dulu untuk membuat tiket helpdesk.
        </Text>
        <Button className="mt-5" onPress={() => openSheet()}>
          <Text className="text-primary-foreground font-bold">Login</Text>
        </Button>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-background">
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader title="Tiket Baru" onBackPress={() => router.back()} />
        <Spinner centered size="large" color="#2563eb" />
      </View>
    );
  }

  if (error || !meta) {
    return (
      <View className="flex-1 bg-background">
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader title="Tiket Baru" onBackPress={() => router.back()} />
        <EmptyState
          className="flex-1"
          title="Gagal memuat metadata helpdesk."
          description="Coba buka halaman ini beberapa saat lagi."
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="Tiket Baru" onBackPress={() => router.back()} />
      <HelpdeskTicketForm
        meta={meta}
        scopedMeta={scopedMeta}
        submitLabel={createTicket.isPending ? "Menyimpan..." : "Kirim Tiket"}
        isSubmitting={createTicket.isPending}
        serverError={serverError}
        onUnitChange={setSelectedUnitId}
        onSubmit={async (payload) => {
          try {
            setServerError(null);
            const ticket = await createTicket.mutateAsync(payload);
            router.replace(`/helpdesk/${ticket.id}` as Href);
          } catch (submitError) {
            setServerError(normalizeApiError(submitError, "Gagal membuat tiket."));
          }
        }}
      />
    </View>
  );
}
