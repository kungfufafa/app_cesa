import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { IconSymbol, IconSymbolName } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface MenuItemProps {
  icon: IconSymbolName;
  title: string;
  onPress?: () => void;
  textColor?: string;
  iconColor?: string;
  showChevron?: boolean;
  destructive?: boolean;
}

export const MenuItem = ({ 
  icon, 
  title, 
  onPress, 
  textColor, 
  iconColor,
  showChevron = true,
  destructive = false
}: MenuItemProps) => {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  
  const finalIconColor = iconColor || (destructive ? '#ef4444' : themeColors.text);
  const finalTextColor = textColor || (destructive ? '#ef4444' : themeColors.text);

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 active:bg-slate-50 dark:active:bg-slate-800"
    >
      <View className="flex-row items-center gap-3">
        <IconSymbol
          name={icon}
          size={22}
          color={finalIconColor}
        />
        <Text 
          className="text-base font-medium" 
          style={{ color: finalTextColor }}
        >
          {title}
        </Text>
      </View>
      {showChevron && (
        <IconSymbol
          name="chevron.right"
          size={20}
          color={Colors[colorScheme ?? 'light'].icon}
        />
      )}
    </TouchableOpacity>
  );
};
