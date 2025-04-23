import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
const icons = {
  info: (
    <InformationCircleIcon
      className="size-6 text-blue-500"
      aria-hidden="true"
    />
  ),
  success: (
    <CheckCircleIcon className="size-6 text-green-500" aria-hidden="true" />
  ),
  warning: (
    <ExclamationCircleIcon
      className="size-6 text-yellow-500"
      aria-hidden="true"
    />
  ),
  error: <XCircleIcon className="size-6 text-red-500" aria-hidden="true" />,
};

export type NotificationProps = {
  notification: {
    id: string;
    type: keyof typeof icons;
    title: string;
    message?: string;
  };
  onDismiss: (id: string) => void;
  autoDismissTime?: number;
};

export const Notification = ({
  notification: { id, type, title, message },
  onDismiss,
  autoDismissTime = 5000,
}: NotificationProps) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const interval = 100; // Update progress every 100ms
    const decrement = (interval / autoDismissTime) * 100;

    const timer = setTimeout(() => {
      onDismiss(id);
    }, autoDismissTime);

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.max(prev - decrement, 0));
    }, interval);

    return () => {
      clearTimeout(timer); // Cleanup the timer on unmount
      clearInterval(progressInterval); // Cleanup the progress interval
    };
  }, [id, onDismiss, autoDismissTime]);

  return (
    <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
      <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black/5">
        <div className="p-4" role="alert" aria-label={title}>
          <div className="flex items-start">
            <div className="shrink-0">{icons[type]}</div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
              <p className="text-sm font-medium text-gray-900">{title}</p>
              <p className="mt-1 text-sm text-gray-500">{message}</p>
            </div>
            <div className="ml-4 flex shrink-0">
              <button
                className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                onClick={() => {
                  onDismiss(id);
                }}
              >
                <span className="sr-only">Close</span>
                <XCircleIcon className="size-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
        <div className="h-1 bg-gray-200">
          <div
            className="h-full bg-blue-300 rounded-2xl transition-all float-right"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
