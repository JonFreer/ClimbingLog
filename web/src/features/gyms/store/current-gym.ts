import { create } from 'zustand';

type CurrentGym = {
  current_gym: string | null;
  setCurrentGym: (gym_id: string) => void;
};

export const useCurrentGym = create<CurrentGym>((set) => ({
  current_gym: null,
  setCurrentGym: (gym_id: string) => {
    set({ current_gym: gym_id });
  },
}));
