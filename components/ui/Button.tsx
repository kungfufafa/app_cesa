import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import { cn } from '@/lib/utils';

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  loading?: boolean;
  className?: string;
  textClassName?: string;
}

export const Button = React.forwardRef<React.ElementRef<typeof TouchableOpacity>, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', loading = false, children, textClassName, disabled, ...props }, ref) => {
    
    const baseStyles = "flex-row items-center justify-center rounded-md font-medium disabled:opacity-50";
    
    const variants = {
      primary: "bg-indigo-600 active:bg-indigo-700",
      secondary: "bg-slate-100 active:bg-slate-200 dark:bg-slate-800 dark:active:bg-slate-700",
      outline: "border border-slate-200 bg-white active:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:active:bg-slate-900",
      ghost: "active:bg-slate-100 dark:active:bg-slate-800",
      destructive: "bg-red-500 active:bg-red-600",
    };

    const sizes = {
      default: "h-12 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-14 rounded-md px-8",
      icon: "h-10 w-10",
    };

    const textStyles = {
      primary: "text-white",
      secondary: "text-slate-900 dark:text-slate-50",
      outline: "text-slate-900 dark:text-slate-50",
      ghost: "text-slate-900 dark:text-slate-50",
      destructive: "text-white",
    };

    return (
      <TouchableOpacity
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          loading && "opacity-70",
          className
        )}
        disabled={loading || disabled}
        {...props}
      >
        {loading ? (
          <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? '#4f46e5' : 'white'} />
        ) : (
          typeof children === 'string' ? (
             <Text className={cn("text-base font-semibold", textStyles[variant], textClassName)}>{children}</Text>
          ) : (
            children
          )
        )}
      </TouchableOpacity>
    );
  }
);
Button.displayName = "Button";
