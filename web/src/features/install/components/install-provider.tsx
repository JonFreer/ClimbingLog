// PromptToInstallProvider.tsx
import React, {
  createContext,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import { Children, IBeforeInstallPromptEvent, PromptCtx } from '../types/types';

const PromptToInstall = createContext<PromptCtx>({ deferredEvt: null });

export function PromptToInstallProvider(props: Children) {
  const [deferredEvt, setDeferredEvt] =
    React.useState<IBeforeInstallPromptEvent | null>(null);

  const hidePrompt = useCallback(() => {
    setDeferredEvt(null);
  }, []);

  useEffect(() => {
    const ready = (e: IBeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredEvt(e);
    };

    window.addEventListener('beforeinstallprompt', ready as any);

    return () => {
      window.removeEventListener('beforeinstallprompt', ready as any);
    };
  }, []);

  return (
    <PromptToInstall.Provider value={{ deferredEvt, hidePrompt }}>
      {props.children}
    </PromptToInstall.Provider>
  );
}

export function usePromptToInstall() {
  const ctx = useContext(PromptToInstall);
  if (!ctx) {
    throw new Error(
      'Cannot use usePromptToInstall() outside <PromptToInstallProvider />',
    );
  }
  return ctx;
}
