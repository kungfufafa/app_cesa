import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { View, Pressable } from "react-native";
import { Text } from "@/components/ui/text";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (__DEV__) {
      console.error("ErrorBoundary caught:", error, info.componentStack);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 justify-center items-center px-6 bg-background">
          <Text className="text-xl font-bold text-foreground mb-2">
            Terjadi Kesalahan
          </Text>
          <Text variant="muted" className="text-center mb-6">
            Aplikasi mengalami masalah. Coba muat ulang.
          </Text>
          <Pressable
            onPress={this.handleReset}
            className="bg-primary px-6 py-3 rounded-lg active:opacity-80"
          >
            <Text className="text-primary-foreground font-semibold">
              Muat Ulang
            </Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}
