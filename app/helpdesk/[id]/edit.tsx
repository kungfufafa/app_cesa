import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Href, Stack, router, useLocalSearchParams } from "expo-router";

import { HelpdeskTicketForm } from "@/components/features/helpdesk/HelpdeskTicketForm";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Text } from "@/components/ui/text";
import {
  useHelpdeskMeta,
  useHelpdeskTicket,
  useUpdateHelpdeskTicket,
} from "@/hooks/helpdesk/useHelpdeskQueries";
import { normalizeApiError } from "@/lib/api-errors";

export default function EditHelpdeskTicketScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const ticketId = id ? Number(id) : undefined;
  const [selectedUnitId, setSelectedUnitId] = useState<number | undefined>();
  const [serverError, setServerError] = useState<string | null>(null);
  const { data: ticket, isLoading: isTicketLoading, error: ticketError } = useHelpdeskTicket(ticketId);
  const { data: meta, isLoading: isMetaLoading, error: metaError } = useHelpdeskMeta();
  const { data: scopedMeta } = useHelpdeskMeta(selectedUnitId ?? ticket?.unit_id ?? undefined);
  const updateTicket = useUpdateHelpdeskTicket(ticketId ?? 0);

  useEffect(() => {
    if (ticket?.unit_id) {
      setSelectedUnitId(ticket.unit_id);
    }
  }, [ticket?.unit_id]);

  if (isTicketLoading || isMetaLoading) {
    return (
      <View className="flex-1 bg-background">
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader title="Edit Tiket" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </View>
    );
  }

  if (ticketError || metaError || !ticket || !meta) {
    return (
      <View className="flex-1 bg-background">
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader title="Edit Tiket" />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="font-semibold">Gagal memuat data tiket.</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="Edit Tiket" />
      <HelpdeskTicketForm
        meta={meta}
        scopedMeta={scopedMeta}
        initialValues={{
          priority_id: ticket.priority_id ?? undefined,
          unit_id: ticket.unit_id ?? undefined,
          problem_category_id: ticket.problem_category_id ?? undefined,
          company_id: ticket.company_id ?? undefined,
          responsible_id: ticket.responsible_id ?? undefined,
          title: ticket.title,
          description: ticket.description ?? "",
          existingAttachments: ticket.attachments,
        }}
        canAssignResponsible={ticket.abilities.assign_responsible}
        submitLabel={updateTicket.isPending ? "Menyimpan..." : "Simpan Perubahan"}
        isSubmitting={updateTicket.isPending}
        serverError={serverError}
        onUnitChange={setSelectedUnitId}
        onSubmit={async (payload) => {
          try {
            setServerError(null);
            const updatedTicket = await updateTicket.mutateAsync(payload);
            router.replace(`/helpdesk/${updatedTicket.id}` as Href);
          } catch (submitError) {
            setServerError(normalizeApiError(submitError, "Gagal memperbarui tiket."));
          }
        }}
      />
    </View>
  );
}
