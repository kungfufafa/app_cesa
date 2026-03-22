import React, { useEffect, useMemo, useRef } from "react";
import { Pressable, View } from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

import { Badge } from "@/components/ui/badge";
import {
  SheetHeader,
  SheetModal,
  SheetScrollView,
  SheetView,
} from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

export type HelpdeskSelectionOption = {
  label: string;
  value: number | string;
  description?: string | null;
};

type HelpdeskSelectionModalProps = {
  visible: boolean;
  title: string;
  options: HelpdeskSelectionOption[];
  selectedValue?: number | string | null;
  onClose: () => void;
  onSelect: (value: number | string | null) => void;
  allowClear?: boolean;
  clearLabel?: string;
  emptyText?: string;
};

export function HelpdeskSelectionModal({
  visible,
  title,
  options,
  selectedValue,
  onClose,
  onSelect,
  allowClear = false,
  clearLabel = "Reset pilihan",
  emptyText = "Belum ada opsi.",
}: HelpdeskSelectionModalProps) {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["70%"], []);

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [visible]);

  return (
    <SheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      onDismiss={onClose}
    >
      <SheetView className="flex-1 px-5 pt-5 pb-8">
        <SheetHeader title={title} className="mb-4" onClose={onClose} />

        {allowClear ? (
          <Button
            variant="secondary"
            className="mb-3"
            onPress={() => {
              onSelect(null);
              onClose();
            }}
          >
            <Text>{clearLabel}</Text>
          </Button>
        ) : null}

        <SheetScrollView showsVerticalScrollIndicator={false}>
          {options.length === 0 ? (
            <View className="rounded-2xl border border-dashed border-border py-10 px-5 items-center">
              <Text className="text-muted-foreground text-center">{emptyText}</Text>
            </View>
          ) : (
            <View className="gap-3">
              {options.map((option) => {
                const isSelected = option.value === selectedValue;

                return (
                  <Pressable
                    key={String(option.value)}
                    className={cn(
                      "rounded-2xl border px-4 py-3 bg-card",
                      isSelected ? "border-primary bg-primary/5" : "border-border"
                    )}
                    onPress={() => {
                      onSelect(option.value);
                      onClose();
                    }}
                  >
                    <View className="flex-row items-start justify-between gap-3">
                      <View className="flex-1">
                        <Text className="font-semibold">{option.label}</Text>
                        {option.description ? (
                          <Text className="text-sm text-muted-foreground mt-1">
                            {option.description}
                          </Text>
                        ) : null}
                      </View>
                      {isSelected ? (
                        <Badge className="bg-primary border-primary">
                          <Text>Dipilih</Text>
                        </Badge>
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </SheetScrollView>
      </SheetView>
    </SheetModal>
  );
}
