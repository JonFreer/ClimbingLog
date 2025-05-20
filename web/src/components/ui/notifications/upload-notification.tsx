import { XCircleIcon } from '@heroicons/react/24/outline';
import { useEffect } from 'react';
import { UploadNotification } from './notifications-store';

export type NotificationProps = {
  notification: UploadNotification;
  onDismiss: (id: string) => void;
  autoDismissTime?: number;
};

export const UploadNotificationComp = ({
  notification,
  onDismiss,
}: NotificationProps) => {
  useEffect(() => {
    if (notification.mutation.progress >= 100) {
      onDismiss(notification.id);
    }
  }, [notification.mutation.progress]);
  return (
    <div className="flex w-full flex-col items-center space-y-4 sm:items-end z-200">
      <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black/5">
        <div className="p-4" role="alert" aria-label={notification.title}>
          <div className="flex items-start">
            <div className="ml-3 w-0 flex-1 pt-0.5">
              <p className="text-sm font-medium text-gray-900">
                {notification.title}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                This may take a while
              </p>
            </div>
            <div className="ml-4 flex shrink-0">
              <button
                className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                onClick={() => {
                  onDismiss(notification.id);
                }}
              >
                <span className="sr-only">Close</span>
                <XCircleIcon className="size-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
        <div className="h-4 bg-gray-200">
          <div
            className="h-full bg-blue-500 rounded-none  transition-all float-left"
            style={{ width: `${notification.mutation.progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
