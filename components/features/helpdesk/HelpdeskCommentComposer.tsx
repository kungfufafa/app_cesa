import React, { useState } from "react";
import { Alert, View } from "react-native";

import { HelpdeskAttachmentList } from "@/components/features/helpdesk/HelpdeskAttachmentList";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Text } from "@/components/ui/text";
import {
  isHelpdeskAttachmentTooLarge,
  MAX_HELPDESK_ATTACHMENTS,
  pickHelpdeskAttachments,
  toHelpdeskFileUploads,
} from "@/lib/helpdesk-attachments";
import type {
  CreateHelpdeskCommentInput,
  HelpdeskCommentVisibility,
  HelpdeskFileUpload,
} from "@/services/helpdesk";

type HelpdeskCommentComposerProps = {
  canAddInternalNote: boolean;
  isSubmitting?: boolean;
  serverError?: string | null;
  onSubmit: (payload: CreateHelpdeskCommentInput) => void | Promise<void>;
};

export function HelpdeskCommentComposer({
  canAddInternalNote,
  isSubmitting = false,
  serverError,
  onSubmit,
}: HelpdeskCommentComposerProps) {
  const [comment, setComment] = useState("");
  const [visibility, setVisibility] = useState<HelpdeskCommentVisibility>("public");
  const [attachments, setAttachments] = useState<HelpdeskFileUpload[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleAddAttachments = async () => {
    const remainingSlots = MAX_HELPDESK_ATTACHMENTS - attachments.length;

    if (remainingSlots <= 0) {
      Alert.alert(
        "Batas Lampiran",
        `Maksimal ${MAX_HELPDESK_ATTACHMENTS} file per komentar.`
      );
      return;
    }

    const picked = await pickHelpdeskAttachments(remainingSlots);
    if (picked.length === 0) {
      return;
    }

    const oversized = picked.find(isHelpdeskAttachmentTooLarge);
    if (oversized) {
      Alert.alert(
        "File Terlalu Besar",
        `${oversized.name} melebihi batas 10 MB.`
      );
      return;
    }

    setAttachments((current) => [...current, ...toHelpdeskFileUploads(picked)]);
  };

  const handleSubmit = async () => {
    const trimmedComment = comment.trim();

    if (!trimmedComment) {
      setValidationError("Komentar wajib diisi.");
      return;
    }

    setValidationError(null);

    await onSubmit({
      comment: trimmedComment,
      visibility,
      attachments,
    });

    setComment("");
    setVisibility("public");
    setAttachments([]);
  };

  return (
    <View className="rounded-[24px] border border-border bg-card px-4 py-4 gap-4">
      <View className="flex-row items-center justify-between">
        <Text className="font-semibold">Tambah Komentar</Text>
        <Button variant="secondary" size="sm" onPress={handleAddAttachments}>
          <Text>Lampiran</Text>
        </Button>
      </View>

      {canAddInternalNote ? (
        <View className="flex-row gap-2">
          <VisibilityChip
            label="Public"
            active={visibility === "public"}
            onPress={() => setVisibility("public")}
          />
          <VisibilityChip
            label="Internal"
            active={visibility === "internal"}
            onPress={() => setVisibility("internal")}
          />
        </View>
      ) : null}

      <Textarea
        value={comment}
        onChangeText={setComment}
        placeholder={
          visibility === "internal"
            ? "Tulis catatan internal untuk tim helpdesk."
            : "Tulis komentar untuk tiket ini."
        }
        numberOfLines={4}
        className="min-h-28 py-3"
      />

      <HelpdeskAttachmentList
        newAttachments={attachments}
        onRemoveNew={(index) =>
          setAttachments((current) =>
            current.filter((_, itemIndex) => itemIndex !== index)
          )
        }
        title="Lampiran Komentar"
      />

      {validationError || serverError ? (
        <Text className="text-destructive text-sm">
          {validationError || serverError}
        </Text>
      ) : null}

      <Button onPress={handleSubmit} disabled={isSubmitting}>
        <Text className="text-primary-foreground font-bold">Kirim Komentar</Text>
      </Button>
    </View>
  );
}

function VisibilityChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Button
      size="sm"
      variant={active ? "default" : "outline"}
      className="rounded-full px-4"
      onPress={onPress}
    >
      <Text className="font-semibold">{label}</Text>
    </Button>
  );
}
