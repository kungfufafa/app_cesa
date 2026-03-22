import React from "react";
import { Linking, Pressable, View } from "react-native";

import { Button } from "@/components/ui/button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Text } from "@/components/ui/text";
import { normalizeApiError } from "@/lib/api-errors";
import type { HelpdeskAttachment, HelpdeskFileUpload } from "@/services/helpdesk";

type HelpdeskAttachmentListProps = {
  existingAttachments?: HelpdeskAttachment[];
  newAttachments?: HelpdeskFileUpload[];
  onRemoveExisting?: (path: string) => void;
  onRemoveNew?: (index: number) => void;
  title?: string;
};

export function HelpdeskAttachmentList({
  existingAttachments = [],
  newAttachments = [],
  onRemoveExisting,
  onRemoveNew,
  title = "Lampiran",
}: HelpdeskAttachmentListProps) {
  const hasAttachments = existingAttachments.length > 0 || newAttachments.length > 0;

  if (!hasAttachments) {
    return null;
  }

  const handleOpenUrl = async (url?: string | null) => {
    if (!url) return;

    try {
      await Linking.openURL(url);
    } catch (error) {
      if (__DEV__) {
        console.warn("Failed to open attachment", normalizeApiError(error));
      }
    }
  };

  return (
    <View className="gap-3">
      <Text className="font-semibold">{title}</Text>

      {existingAttachments.map((attachment) => (
        <View
          key={attachment.path}
          className="rounded-2xl border border-border bg-card px-4 py-3"
        >
          <View className="flex-row items-start gap-3">
            <View className="w-10 h-10 rounded-full bg-secondary items-center justify-center">
              <IconSymbol name="doc.text.fill" size={20} color="#2563eb" />
            </View>
            <View className="flex-1">
              <Text className="font-medium">{attachment.name}</Text>
              <Text className="text-xs text-muted-foreground mt-1">
                File server
              </Text>
            </View>
            <View className="items-end gap-2">
              {attachment.url ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-0 min-h-0"
                  onPress={() => handleOpenUrl(attachment.url)}
                >
                  <Text className="text-primary font-semibold">Buka</Text>
                </Button>
              ) : null}
              {onRemoveExisting ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-0 min-h-0"
                  onPress={() => onRemoveExisting(attachment.path)}
                >
                  <Text className="text-destructive font-semibold">Hapus</Text>
                </Button>
              ) : null}
            </View>
          </View>
        </View>
      ))}

      {newAttachments.map((attachment, index) => (
        <View
          key={`${attachment.name}-${index}`}
          className="rounded-2xl border border-dashed border-border bg-background px-4 py-3"
        >
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
              <IconSymbol name="paperplane.fill" size={18} color="#2563eb" />
            </View>
            <View className="flex-1">
              <Text className="font-medium">{attachment.name}</Text>
              <Text className="text-xs text-muted-foreground mt-1">
                Siap diupload
              </Text>
            </View>
            {onRemoveNew ? (
              <Pressable onPress={() => onRemoveNew(index)}>
                <Text className="text-destructive font-semibold">Hapus</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
}
