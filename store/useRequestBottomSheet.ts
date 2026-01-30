import { create } from "zustand";

interface RequestBottomSheetState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useRequestBottomSheet = create<RequestBottomSheetState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
