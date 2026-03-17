import React, { useEffect, useMemo, useRef, useState } from "react";
import { View } from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

import { Button } from "@/components/ui/Button";
import {
  SheetHeader,
  SheetModal,
  SheetView,
} from "@/components/ui/BottomSheet";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/text";
import {
  getHelpdeskActionLabel,
  getHelpdeskActionReasonLabel,
  getHelpdeskActionReasonPlaceholder,
  type HelpdeskStatusAction,
} from "@/lib/helpdesk";

type HelpdeskReasonModalProps = {
  visible: boolean;
  action: HelpdeskStatusAction | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void | Promise<void>;
};

const actionsRequiringReason: HelpdeskStatusAction[] = ["cancel", "close", "reopen"];

export function HelpdeskReasonModal({
  visible,
  action,
  isSubmitting = false,
  onClose,
  onSubmit,
}: HelpdeskReasonModalProps) {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["50%"], []);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
      setReason("");
      setError(null);
    }
  }, [visible]);

  if (!action) {
    return null;
  }

  const requiresReason = actionsRequiringReason.includes(action);

  const handleSubmit = async () => {
    const trimmedReason = reason.trim();

    if (requiresReason && !trimmedReason) {
      setError(`${getHelpdeskActionReasonLabel(action)} wajib diisi.`);
      return;
    }

    setError(null);
    await onSubmit(trimmedReason);
  };

  return (
    <SheetModal ref={bottomSheetRef} snapPoints={snapPoints} onDismiss={onClose}>
      <SheetView className="flex-1 px-5 py-5">
        <SheetHeader
          title={getHelpdeskActionLabel(action)}
          description={
            requiresReason
              ? "Tambahkan alasan sebelum mengirim perubahan status."
              : "Status tiket akan dipindahkan ke tahap berikutnya."
          }
          onClose={onClose}
        />

        {requiresReason ? (
          <View className="mt-4 gap-2">
            <Text className="font-medium">{getHelpdeskActionReasonLabel(action)}</Text>
            <Input
              multiline
              numberOfLines={4}
              value={reason}
              onChangeText={setReason}
              placeholder={getHelpdeskActionReasonPlaceholder(action)}
              textAlignVertical="top"
              className="min-h-28 py-3"
            />
          </View>
        ) : null}

        {error ? <Text className="text-destructive text-sm mt-3">{error}</Text> : null}

        <View className="flex-row gap-3 mt-5">
          <Button variant="outline" className="flex-1" onPress={onClose}>
            <Text>Batal</Text>
          </Button>
          <Button className="flex-1" onPress={handleSubmit} disabled={isSubmitting}>
            <Text className="text-primary-foreground font-bold">Simpan</Text>
          </Button>
        </View>
      </SheetView>
    </SheetModal>
  );
}
