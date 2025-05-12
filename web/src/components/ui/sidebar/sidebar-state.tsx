import { create } from 'zustand';
import { Route } from '../../../types/routes';

type SidebarState = {
  route: Route | null;
  openSidebar: (route: Route) => void;
  closeSidebar: () => void;
};

export const useSidebarState = create<SidebarState>((set) => ({
  route: null,
  closeSidebar: () => {
    set({ route: null });
  },
  openSidebar: (route: Route) => {
    set((state) => {
      if (state.route == null) {
        window.addEventListener('popstate', () => set({ route: null }));
        window.history.pushState(null, '', window.location.href);
      }
      return { route };
    });
  },
}));
