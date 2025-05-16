import { useNotifications } from '@/components/ui/notifications';
import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import { useCreateVideo } from '../api/create-beta';
import { PlusCircleIcon } from '@heroicons/react/24/solid';
import { useUser } from '@/lib/auth';
import { api } from '@/lib/api-client';

type CreateBetaProps = {
  route_id: string;
};

export const CreateBeta = ({ route_id }: CreateBetaProps) => {
  const [open, setOpen] = useState(false);
  const user = useUser();
  const inputRef = useRef<HTMLInputElement>(null);

  const [source, setSource] = useState('');

  const createVideoMutation = useCreateVideo({
    mutationConfig: {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'Video is being processed.',
          message: 'Check back in a few minutes.',
        });
        setOpen(false);
      },
    },
    route_id: route_id,
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files[0];
    const url = URL.createObjectURL(file);
    setSource(url);
  };

  const handleChoose = () => {
    inputRef.current.click();
  };

  const { addNotification } = useNotifications();

  useEffect(() => {
    if (open) {
      setSource('');
    }
  }, [open]);

  return (
    <>
      <div
        onClick={() => {
          setOpen(true);
        }}
        className="mt-2 inline-block w-30 h-30 rounded-lg bg-gray-100 border-2 border-white shadow-sm hover:bg-gray-200 cursor-pointer"
      >
        <div className="flex justify-center items-center h-full">
          <PlusCircleIcon className="size-8 text-gray-300" />
        </div>
      </div>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        className="relative z-100"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-leave:duration-200 data-enter:ease-out data-leave:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-leave:duration-200 data-enter:ease-out data-leave:ease-in my-auto sm:w-full sm:max-w-lg sm:data-closed:translate-y-0 sm:data-closed:scale-95"
            >
              {user.data?.is_verified ? (
                <form
                  className="space-y-6 w-full"
                  onSubmit={(e) => {
                    e.preventDefault();

                    if (!inputRef.current?.files?.[0]) {
                      addNotification({
                        type: 'error',
                        title: 'Please select a file',
                      });
                      return;
                    }
                    console.log('mutate');
                    createVideoMutation.mutate({
                      data: {
                        route_id: route_id,
                        file: inputRef.current.files[0],
                      },
                    });
                  }}
                >
                  <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="w-full mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                        <DialogTitle
                          as="h3"
                          className="text-base font-semibold text-gray-900"
                        >
                          Upload video
                        </DialogTitle>
                        <div className="mt-2 mb-4"></div>
                        <div>
                          {!source && (
                            <button onClick={handleChoose}>Choose</button>
                          )}
                          {source && (
                            <video
                              className="m-auto rounded-lg"
                              width="200px"
                              controls
                              src={source}
                            />
                          )}
                          <label
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            htmlFor="multiple_files"
                          >
                            Upload multiple files
                          </label>
                          <input
                            ref={inputRef}
                            className="block w-full p-4 text-sm text-gray-900 rounded-lg cursor-pointer bg-gray-50 focus:outline-none "
                            type="file"
                            onChange={handleFileChange}
                            accept=".mov,.mp4"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                      type="submit"
                      //   onClick={() => props.setOpen("")}
                      className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-green-500 sm:ml-3 sm:w-auto"
                    >
                      Upload {createVideoMutation.progress}%
                    </button>
                    <button
                      type="button"
                      data-autofocus
                      onClick={() => setOpen(false)}
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6 w-full">
                  <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="w-full mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                        <DialogTitle
                          as="h3"
                          className="text-base font-semibold text-gray-900"
                        >
                          Verify your email
                        </DialogTitle>
                        <div className="mt-2 mb-4">
                          To upload a video, you need to verify your email
                          address.
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                      type="submit"
                      onClick={() => {
                        api
                          .post('/auth/request-verify-token', {
                            email: user.data?.email,
                          })
                          .then(() => {
                            addNotification({
                              title: 'Verification Email Sent',
                              message:
                                'Please check your email for the verification link.',
                              type: 'success',
                            });
                            setOpen(false);
                          })
                          .catch((error) => {
                            console.error(
                              'Error sending verification email:',
                              error,
                            );
                            addNotification({
                              title: 'Error',
                              message:
                                'There was an error sending the verification email.',
                              type: 'error',
                            });
                          });
                      }}
                      className="inline-flex w-full justify-center rounded-md bg-violet-500 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-green-600 sm:ml-3 sm:w-auto"
                    >
                      Send Email
                    </button>
                    <button
                      type="button"
                      data-autofocus
                      onClick={() => setOpen(false)}
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
};
