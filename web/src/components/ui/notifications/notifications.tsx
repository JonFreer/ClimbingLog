import { InstallPrompt } from '@/features/install/components/install-prompt.tsx';
import { Notification } from './notification';
import { useNotifications } from './notifications-store.ts';
import { UploadNotificationComp } from './upload-notification.tsx';

export const Notifications = () => {
  const { notifications, dismissNotification } = useNotifications();

  return (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed inset-0 z-150 flex flex-col items-end space-y-4 px-4 py-6 sm:items-start sm:p-6"
    >
      <InstallPrompt />
      {notifications.map((notification) => {
        switch (notification.type) {
          case 'info':
          case 'warning':
          case 'success':
          case 'error':
            return (
              <Notification
                key={notification.id}
                notification={notification}
                onDismiss={dismissNotification}
              />
            );
          case 'upload':
            return (
              <UploadNotificationComp
                key={notification.id}
                notification={notification}
                onDismiss={dismissNotification}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
};
