import { UseCreateVideoReturn } from '@/features/videos/api/create-beta';
import { nanoid } from 'nanoid';
import { create } from 'zustand';

export type Notification = BasicNotification | UploadNotification;

export type BasicNotification = {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message?: string;
};

export type UploadNotification = {
  id: string;
  type: 'upload';
  title: string;
  mutation: UseCreateVideoReturn;
};

type NotificationsStore = {
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  dismissNotification: (id: string) => void;
  updateNotificationProgress: (id: string, progress: number) => void;
};

export const useNotifications = create<NotificationsStore>((set) => ({
  notifications: [],
  addNotification: (notification: Notification) => {
    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          ...notification,
          id: 'id' in notification ? notification.id : nanoid(),
        } as Notification,
      ],
    }));
  },
  dismissNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter(
        (notification) => notification.id !== id,
      ),
    })),

  updateNotificationProgress: (id: string, progress: number) => {
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === id && notification.type === 'upload'
          ? {
              ...notification,
              mutation: {
                ...notification.mutation,
                progress,
              },
            }
          : notification,
      ),
    }));
  },
}));
