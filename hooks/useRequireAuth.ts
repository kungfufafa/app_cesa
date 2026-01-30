import { useAuthStore } from "@/store/useAuthStore";
import { useAuthBottomSheet } from "@/store/useAuthBottomSheet";

export function useRequireAuth() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const openSheet = useAuthBottomSheet((s) => s.open);

  const requireAuth = (action: () => void) => {
    if (isAuthenticated) {
      action();
    } else {
      openSheet(action);
    }
  };

  return { requireAuth, isAuthenticated };
}
