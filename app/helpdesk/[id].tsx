import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  View,
} from "react-native";
import { Href, Stack, router, useLocalSearchParams } from "expo-router";

import { HelpdeskAttachmentList } from "@/components/features/helpdesk/HelpdeskAttachmentList";
import { HelpdeskCommentComposer } from "@/components/features/helpdesk/HelpdeskCommentComposer";
import { HelpdeskRichText } from "@/components/features/helpdesk/HelpdeskRichText";
import { HelpdeskReasonModal } from "@/components/features/helpdesk/HelpdeskReasonModal";
import { HelpdeskStatusBadge } from "@/components/features/helpdesk/HelpdeskStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import {
  useAddHelpdeskComment,
  useChangeHelpdeskTicketStatus,
  useDeleteHelpdeskTicket,
  useHelpdeskTicket,
} from "@/hooks/helpdesk/useHelpdeskQueries";
import { normalizeApiError } from "@/lib/api-errors";
import {
  getAvailableHelpdeskActions,
  getHelpdeskActionLabel,
  getHelpdeskPriorityBadgeClasses,
  getVisibleHelpdeskComments,
  HELPDESK_STATUS,
  type HelpdeskStatusAction,
} from "@/lib/helpdesk";
import dayjs from "@/lib/dates";

export default function HelpdeskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const ticketId = id ? Number(id) : undefined;
  const [activeAction, setActiveAction] = useState<HelpdeskStatusAction | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [commentError, setCommentError] = useState<string | null>(null);
  const { data: ticket, isLoading, error } = useHelpdeskTicket(ticketId);
  const changeStatus = useChangeHelpdeskTicketStatus(ticketId ?? 0);
  const addComment = useAddHelpdeskComment(ticketId ?? 0);
  const deleteTicket = useDeleteHelpdeskTicket(ticketId ?? 0);

  if (isLoading) {
    return (
      <View className="flex-1 bg-background">
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader title="Detail Tiket" onBackPress={() => router.back()} />
        <Spinner centered size="large" color="#2563eb" />
      </View>
    );
  }

  if (error || !ticket) {
    return (
      <View className="flex-1 bg-background">
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader title="Detail Tiket" onBackPress={() => router.back()} />
        <EmptyState
          className="flex-1"
          title="Gagal memuat detail tiket."
          description="Coba muat ulang halaman ini beberapa saat lagi."
        />
      </View>
    );
  }

  const priorityClasses = getHelpdeskPriorityBadgeClasses(ticket.priority?.name);
  const comments = getVisibleHelpdeskComments(ticket.comments, ticket.abilities);
  const actions = getAvailableHelpdeskActions(ticket);

  const handleStatusSubmit = async (reason: string) => {
    try {
      setStatusError(null);

      if (activeAction === "start_progress") {
        await changeStatus.mutateAsync({
          ticket_status_id: HELPDESK_STATUS.IN_PROGRESS,
        });
      }

      if (activeAction === "cancel") {
        await changeStatus.mutateAsync({
          ticket_status_id: HELPDESK_STATUS.CANCELLED,
          cancel_reason: reason,
        });
      }

      if (activeAction === "close") {
        await changeStatus.mutateAsync({
          ticket_status_id: HELPDESK_STATUS.CLOSED,
          close_reason: reason,
        });
      }

      if (activeAction === "reopen") {
        await changeStatus.mutateAsync({
          ticket_status_id: HELPDESK_STATUS.OPEN,
          reopen_reason: reason,
        });
      }

      setActiveAction(null);
    } catch (mutationError) {
      setStatusError(normalizeApiError(mutationError, "Gagal mengubah status tiket."));
    }
  };

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader
        title="Detail Tiket"
        onBackPress={() => router.back()}
        rightAction={
          ticket.abilities.update ? (
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full bg-white/15 px-3"
              onPress={() => router.push(`/helpdesk/${ticket.id}/edit` as Href)}
            >
              <Text className="text-white font-semibold text-sm">Edit</Text>
            </Button>
          ) : (
            <View className="w-9 h-9" />
          )
        }
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-4">
          <Card className="py-0">
            <CardContent className="py-5 gap-4">
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1">
                  <Text className="text-xl font-semibold">{ticket.title}</Text>
                  <Text className="text-sm text-muted-foreground mt-1">
                    #{ticket.id} • Dibuat {dayjs(ticket.created_at).format("DD MMM YYYY, HH:mm")}
                  </Text>
                </View>
                <HelpdeskStatusBadge
                  statusId={ticket.ticket_status_id}
                  fallbackLabel={ticket.ticket_status?.name}
                />
              </View>

              <View className="flex-row flex-wrap gap-2">
                {ticket.priority?.name ? (
                  <Badge variant="outline" className={priorityClasses.container}>
                    <Text className={priorityClasses.text}>
                      {ticket.priority.name}
                    </Text>
                  </Badge>
                ) : null}
                {ticket.unit?.name ? (
                  <Badge variant="secondary">
                    <Text>{ticket.unit.name}</Text>
                  </Badge>
                ) : null}
                {ticket.problem_category?.name ? (
                  <Badge variant="outline">
                    <Text>{ticket.problem_category.name}</Text>
                  </Badge>
                ) : null}
              </View>

              <InfoRow label="Pelapor" value={ticket.owner?.name || "-"} />
              <InfoRow label="Email Pelapor" value={ticket.owner?.email || "-"} />
              <InfoRow label="Responsible" value={ticket.responsible?.name || "Belum ditentukan"} />
              <InfoRow label="Perusahaan" value={ticket.company?.name || "-"} />
              <View className="gap-1">
                <Text className="text-sm text-muted-foreground">Deskripsi</Text>
                <HelpdeskRichText
                  html={ticket.description}
                  className="leading-6"
                  showInlineLinks
                />
              </View>

              <HelpdeskAttachmentList
                existingAttachments={ticket.attachments}
                title="Lampiran Tiket"
              />

              {ticket.cancel_reason ? (
                <ReasonCard title="Alasan Pembatalan" value={ticket.cancel_reason} />
              ) : null}
              {ticket.close_reason ? (
                <ReasonCard title="Alasan Penutupan" value={ticket.close_reason} />
              ) : null}
              {ticket.reopen_reason ? (
                <ReasonCard title="Alasan Buka Kembali" value={ticket.reopen_reason} />
              ) : null}
            </CardContent>
          </Card>

          {(actions.length > 0 || ticket.abilities.delete) && (
            <Card className="py-0">
              <CardContent className="py-5 gap-3">
                <Text className="font-semibold">Aksi Tiket</Text>

                {statusError ? (
                  <Text className="text-destructive text-sm">{statusError}</Text>
                ) : null}

                <View className="flex-row flex-wrap gap-3">
                  {actions.map((action) => (
                    <Button
                      key={action}
                      variant={action === "cancel" ? "destructive" : "secondary"}
                      size="sm"
                      onPress={() => {
                        setStatusError(null);
                        if (action === "start_progress") {
                          setActiveAction("start_progress");
                          void handleStatusSubmit("");
                          return;
                        }
                        setActiveAction(action);
                      }}
                    >
                      <Text className={action === "cancel" ? "text-white" : ""}>
                        {getHelpdeskActionLabel(action)}
                      </Text>
                    </Button>
                  ))}

                  {ticket.abilities.delete ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onPress={() => {
                        Alert.alert(
                          "Hapus Tiket",
                          "Tiket yang dihapus tidak bisa dikembalikan. Lanjutkan?",
                          [
                            { text: "Batal", style: "cancel" },
                            {
                              text: "Hapus",
                              style: "destructive",
                              onPress: () => {
                                void deleteTicket
                                  .mutateAsync()
                                  .then(() => router.replace("/inbox"))
                                  .catch((deleteError) => {
                                    setStatusError(
                                      normalizeApiError(
                                        deleteError,
                                        "Gagal menghapus tiket."
                                      )
                                    );
                                  });
                              },
                            },
                          ]
                        );
                      }}
                    >
                      <Text>Hapus</Text>
                    </Button>
                  ) : null}
                </View>
              </CardContent>
            </Card>
          )}

          {ticket.histories.length > 0 ? (
            <Card className="py-0">
              <CardContent className="py-5 gap-4">
                <Text className="font-semibold">Riwayat Status</Text>
                {ticket.histories.map((history) => (
                  <View key={history.id} className="flex-row gap-3">
                    <View className="items-center">
                      <View className="w-3 h-3 rounded-full bg-primary mt-2" />
                      <View className="flex-1 w-px bg-border mt-2" />
                    </View>
                    <View className="flex-1 pb-3">
                      <Text className="font-medium">{history.ticket_status.name}</Text>
                      <Text className="text-sm text-muted-foreground mt-1">
                        Oleh {history.user.name}
                      </Text>
                      <Text className="text-xs text-muted-foreground mt-1">
                        {dayjs(history.created_at).format("DD MMM YYYY, HH:mm")}
                      </Text>
                    </View>
                  </View>
                ))}
              </CardContent>
            </Card>
          ) : null}

          <Card className="py-0">
            <CardContent className="py-5 gap-4">
              <Text className="font-semibold">Komentar</Text>
              {comments.length === 0 ? (
                <Text className="text-sm text-muted-foreground">
                  Belum ada komentar.
                </Text>
              ) : (
                comments.map((comment) => (
                  <View
                    key={comment.id}
                    className="rounded-2xl border border-border bg-background px-4 py-4 gap-3"
                  >
                    <View className="flex-row items-start justify-between gap-3">
                      <View className="flex-1">
                        <Text className="font-semibold">{comment.user.name}</Text>
                        <Text className="text-xs text-muted-foreground mt-1">
                          {dayjs(comment.created_at).format("DD MMM YYYY, HH:mm")}
                        </Text>
                      </View>
                      {comment.visibility === "internal" ? (
                        <Badge variant="secondary">
                          <Text>Internal</Text>
                        </Badge>
                      ) : null}
                    </View>

                    <HelpdeskRichText
                      html={comment.comment}
                      className="text-sm leading-6"
                      showInlineLinks
                    />

                    <HelpdeskAttachmentList
                      existingAttachments={comment.attachments}
                      title="Lampiran Komentar"
                    />
                  </View>
                ))
              )}
            </CardContent>
          </Card>

          {ticket.abilities.comment ? (
            <HelpdeskCommentComposer
              canAddInternalNote={ticket.abilities.add_internal_note}
              isSubmitting={addComment.isPending}
              serverError={commentError}
              onSubmit={async (payload) => {
                try {
                  setCommentError(null);
                  await addComment.mutateAsync(payload);
                } catch (commentMutationError) {
                  setCommentError(
                    normalizeApiError(commentMutationError, "Gagal mengirim komentar.")
                  );
                  throw commentMutationError;
                }
              }}
            />
          ) : null}
        </View>
      </ScrollView>

      <HelpdeskReasonModal
        visible={!!activeAction && activeAction !== "start_progress"}
        action={activeAction === "start_progress" ? null : activeAction}
        isSubmitting={changeStatus.isPending}
        onClose={() => setActiveAction(null)}
        onSubmit={handleStatusSubmit}
      />
    </View>
  );
}

function InfoRow({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <View className="gap-1">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <Text className={multiline ? "leading-6" : "font-medium"}>{value}</Text>
    </View>
  );
}

function ReasonCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <View className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
      <Text className="text-sm font-semibold text-amber-800">{title}</Text>
      <Text className="text-sm text-amber-900 mt-2 leading-6">{value}</Text>
    </View>
  );
}
