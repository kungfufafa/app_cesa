import { create } from "zustand";

interface MoreServicesStore {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useMoreServicesStore = create<MoreServicesStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
