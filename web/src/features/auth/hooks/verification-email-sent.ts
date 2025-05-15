import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type verificationEmailSent = {
  sent: boolean;
  setSent: () => void;
};

export const useVerificationEmailSent = create<verificationEmailSent>()(
  persist(
    (set) => ({
      sent: false,
      setSent: () => set({ sent: true }),
    }),
    {
      name: 'verification-email-sent',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
