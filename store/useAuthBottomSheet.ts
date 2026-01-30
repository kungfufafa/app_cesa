import { create } from "zustand";

interface AuthBottomSheetState {
  isOpen: boolean;
  onSuccessCallback: (() => void) | null;
  open: (onSuccess?: () => void) => void;
  close: () => void;
  executeCallback: () => void;
}

export const useAuthBottomSheet = create<AuthBottomSheetState>((set, get) => ({
  isOpen: false,
  onSuccessCallback: null,
  open: (onSuccess) =>
    set({ isOpen: true, onSuccessCallback: onSuccess || null }),
  close: () => set({ isOpen: false }),
  executeCallback: () => {
    const callback = get().onSuccessCallback;
    if (callback) {
      callback();
      set({ onSuccessCallback: null });
    }
  },
}));
