import {
  DevicePhoneMobileIcon,
  EllipsisVerticalIcon,
  XCircleIcon,
} from '@heroicons/react/24/solid';
import { useState } from 'react';
import { usePromptToInstall } from './install-provider';

export function InstallPrompt() {
  const { deferredEvt, hidePrompt } = usePromptToInstall(); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [open, setOpen] = useState(false);

  const [notificationOpen, setNotificationOpen] = useState(
    Math.random() * 10 + 1 > 10 &&
      !window.matchMedia('(display-mode: standalone)').matches,
  );

  if (!notificationOpen) {
    return null;
  }

  return (
    <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
      <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black/5">
        <div className="p-4" role="alert" aria-label={'Install VolumeDB'}>
          <div className="flex items-start">
            {!open && (
              <button
                onClick={() => {
                  if (!deferredEvt) {
                    setOpen(true);
                  } else {
                    deferredEvt.prompt();
                  }
                }}
                className="p-2 bg-violet-600 text-white font-semibold rounded-lg self-center hover:bg-violet-700 cursor-pointer"
              >
                Install
              </button>
            )}
            <div className="ml-3 w-0 flex-1 pt-0.5">
              {!open ? (
                <>
                  <p className="text-sm font-medium text-gray-900">
                    Install VolumeDB{' '}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Install VolumeDB to your device for a better experience.
                  </p>
                </>
              ) : (
                <>
                  {navigator.userAgent.includes('iPhone') ||
                  navigator.userAgent.includes('iPad') ? (
                    <>
                      <p className="text-sm font-medium text-gray-900 mt-2">
                        Installing on iOS
                      </p>
                      <div className="flex mt-1 text-sm text-gray-500">
                        <EllipsisVerticalIcon className="size-5" />
                        Click on the share button{' '}
                      </div>
                      <div className="flex mt-1 text-sm text-gray-500">
                        <DevicePhoneMobileIcon className="size-5" />
                        Click "Add to home screen"{' '}
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-gray-900 mt-2">
                        Installing on Android
                      </p>
                      <div className="flex mt-1 text-sm text-gray-500">
                        <EllipsisVerticalIcon className="size-5" />
                        Click on the three dots{' '}
                      </div>
                      <div className="flex mt-1 text-sm text-gray-500">
                        <DevicePhoneMobileIcon className="size-5" />
                        Click "Add to home screen"{' '}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
            <div className="ml-4 flex shrink-0">
              <button
                className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                onClick={() => {
                  setNotificationOpen(false);
                }}
              >
                <span className="sr-only">Close</span>
                <XCircleIcon className="size-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
