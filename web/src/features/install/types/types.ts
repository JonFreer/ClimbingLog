import { ReactElement } from 'react';

// types.ts
export interface IBeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}
export type PromptCtx = {
  deferredEvt: IBeforeInstallPromptEvent | null;
  hidePrompt?: () => void;
};
export type Children = {
  children: ReactElement | ReactElement[] | string | null;
};
