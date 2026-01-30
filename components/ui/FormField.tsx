import React from 'react';
import { View, Text, TextInputProps, TextInput } from 'react-native';
import { Input } from './Input';
import { cn } from '@/lib/utils';

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
  containerClassName?: string;
}

export const FormField = React.forwardRef<TextInput, FormFieldProps>(
  ({ label, error, containerClassName, ...props }, ref) => {
    return (
      <View className={cn("mb-4 space-y-2", containerClassName)}>
        <Text className="text-sm font-medium leading-none text-slate-700 dark:text-slate-300">
          {label}
        </Text>
        <Input ref={ref} {...props} className={error ? "border-red-500" : undefined} />
        {error && (
          <Text className="text-xs font-medium text-red-500">
            {error}
          </Text>
        )}
      </View>
    );
  }
);
FormField.displayName = "FormField";
