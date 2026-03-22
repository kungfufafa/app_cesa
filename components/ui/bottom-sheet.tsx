import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
  type BottomSheetModalProps,
} from "@gorhom/bottom-sheet";
import { cssInterop } from "nativewind";
import React from "react";
import { View } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { cn } from "@/lib/utils";

cssInterop(BottomSheetView, {
  className: {
    target: "style",
  },
});

cssInterop(BottomSheetScrollView, {
  className: {
    target: "style",
  },
});

type SheetBackdropProps = React.ComponentProps<typeof BottomSheetBackdrop>;

export function SheetBackdrop(props: SheetBackdropProps) {
  return <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />;
}

type SheetModalProps = BottomSheetModalProps;

export const SheetModal = React.forwardRef<BottomSheetModal, SheetModalProps>(
  (
    {
      enablePanDownToClose = true,
      enableDynamicSizing = false,
      keyboardBehavior = "interactive",
      keyboardBlurBehavior = "restore",
      android_keyboardInputMode = "adjustResize",
      backdropComponent,
      backgroundStyle,
      handleIndicatorStyle,
      ...props
    },
    ref
  ) => {
    const colorScheme = useColorScheme();

    return (
      <BottomSheetModal
        ref={ref}
        enablePanDownToClose={enablePanDownToClose}
        enableDynamicSizing={enableDynamicSizing}
        keyboardBehavior={keyboardBehavior}
        keyboardBlurBehavior={keyboardBlurBehavior}
        android_keyboardInputMode={android_keyboardInputMode}
        backdropComponent={backdropComponent ?? SheetBackdrop}
        backgroundStyle={[
          { backgroundColor: Colors[colorScheme ?? "light"].background },
          backgroundStyle,
        ]}
        handleIndicatorStyle={[
          { backgroundColor: Colors[colorScheme ?? "light"].icon },
          handleIndicatorStyle,
        ]}
        {...props}
      />
    );
  }
);

SheetModal.displayName = "SheetModal";

export const SheetView = BottomSheetView;
export const SheetScrollView = BottomSheetScrollView;

type SheetHeaderProps = {
  title: string;
  description?: string;
  onClose?: () => void;
  rightAction?: React.ReactNode;
  className?: string;
};

export function SheetHeader({
  title,
  description,
  onClose,
  rightAction,
  className,
}: SheetHeaderProps) {
  return (
    <View className={cn("flex-row items-start justify-between gap-3", className)}>
      <View className="flex-1">
        <Text className="text-lg font-semibold text-foreground">{title}</Text>
        {description ? (
          <Text className="text-sm text-muted-foreground mt-1">{description}</Text>
        ) : null}
      </View>
      {rightAction ? (
        rightAction
      ) : onClose ? (
        <Button variant="ghost" size="icon" onPress={onClose} className="rounded-full">
          <IconSymbol name="xmark" size={18} color="#71717a" />
        </Button>
      ) : null}
    </View>
  );
}
