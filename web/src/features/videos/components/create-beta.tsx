import {
  BasicNotification,
  UploadNotification,
  useNotifications,
} from '@/components/ui/notifications';
import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import { useCreateVideo } from '../api/create-beta';
import { PhotoIcon, PlusCircleIcon } from '@heroicons/react/24/solid';
import { useUser } from '@/lib/auth';
import { api } from '@/lib/api-client';
import { nanoid } from 'nanoid';

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
        } as BasicNotification);
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
                      } as BasicNotification);
                      return;
                    }
                    const notificationId = nanoid();
                    createVideoMutation.mutate({
                      data: {
                        notificationId: notificationId,
                        route_id: route_id,
                        file: inputRef.current.files[0],
                      },
                    });
                    addNotification({
                      id: notificationId,
                      type: 'upload',
                      title: 'Uploading your video',
                      mutation: createVideoMutation,
                    } as UploadNotification);
                    setOpen(false);
                  }}
                >
                  <div className="bg-white px-4 pt-5 sm:p-6">
                    <div className="sm:flex sm:items-start">
                      <div className="w-full mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                        <div className="mt-2 mb-4"></div>
                        <div>
                          {/* {!source && (
                            <button onClick={handleChoose}>Choose</button>
                          )} */}
                          {source ? (
                            <>
                              <video
                                className="m-auto rounded-lg"
                                width="200px"
                                controls
                                src={source}
                              />

                              <div
                                className="mt-4 p-2 bg-gray-600 text-white font-semibold rounded-lg cursor-pointer hover:bg-gray-700"
                                onClick={() => {
                                  inputRef.current?.click();
                                }}
                              >
                                Choose new video
                              </div>
                            </>
                          ) : (
                            <div
                              className="min-w-60 mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 cursor-pointer"
                              onClick={() => inputRef.current?.click()}
                            >
                              <div className="text-center">
                                <PhotoIcon
                                  aria-hidden="true"
                                  className="mx-auto size-12 text-gray-300"
                                />
                                <div className="mt-4 flex text-sm/6 text-gray-600">
                                  <label
                                    htmlFor="file-upload"
                                    className="w-full text-center relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-hidden focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                                  >
                                    <span>Upload a video</span>
                                  </label>
                                </div>
                                <p className="text-xs/5 text-gray-600">
                                  MOV or MP4
                                </p>
                              </div>
                            </div>
                          )}
                          <input
                            id="file-upload"
                            ref={inputRef}
                            className="sr-only"
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
                      {createVideoMutation.progress !== 0
                        ? `Uploading: ${createVideoMutation.progress}%`
                        : 'Upload'}
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
                            } as BasicNotification);
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
                            } as BasicNotification);
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
