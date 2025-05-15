import { create } from 'zustand';

type justRegistered = {
  justRegistered: boolean;
  setJustRegistered: () => void;
};

export const useJustRegistered = create<justRegistered>()((set) => ({
  justRegistered: false,
  setJustRegistered: () => set(() => ({ justRegistered: true })),
}));
