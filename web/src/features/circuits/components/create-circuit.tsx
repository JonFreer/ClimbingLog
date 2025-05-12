import { useState } from 'react';
import { useNotifications } from '@/components/ui/notifications';
import { useCreateCircuit } from '../api/create-circuit';
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';

export const CreateCircuit = () => {
  const [open, setOpen] = useState(false);

  const { addNotification } = useNotifications();

  const createCircuitMutation = useCreateCircuit({
    mutationConfig: {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'Circuit Created',
        });
        setOpen(false);
      },
    },
  });

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="ml-auto bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-700 hover:to-blue-900 text-white font-bold py-2 px-4 rounded-sm shadow-lg transform transition-transform duration-300 hover:scale-105"
      >
        Add Circuit
      </button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        className="relative z-10"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-leave:duration-200 data-enter:ease-out data-leave:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-leave:duration-200 data-enter:ease-out data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:data-closed:translate-y-0 sm:data-closed:scale-95"
            >
              <form
                action="#"
                method="POST"
                className="space-y-6 w-full"
                onSubmit={(event) => {
                  event.preventDefault();
                  const formData = new FormData(event.currentTarget);
                  const values = Object.fromEntries(formData.entries()) as {
                    name: string;
                    color: string;
                  };
                  createCircuitMutation.mutate({ data: values });
                }}
              >
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="w-full mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <DialogTitle
                        as="h3"
                        className="text-base font-semibold text-gray-900"
                      >
                        Add a new circuit
                      </DialogTitle>
                      <div className="mt-2 mb-4"></div>
                      <div>
                        <div className="flex items-center justify-between">
                          <label
                            htmlFor="name"
                            className="block text-sm/6 font-medium text-gray-900"
                          >
                            Circuit Name
                          </label>
                        </div>
                        <div className="mt-2">
                          <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <label
                            htmlFor="color"
                            className="block text-sm/6 font-medium text-gray-900"
                          >
                            Color
                          </label>
                        </div>
                        <div>
                          <p
                            id="comments-description"
                            className="text-gray-500"
                          >
                            Color includes: violet, red, green, blue, yellow,
                            orange, black, pink
                          </p>
                        </div>
                        <div className="mt-2">
                          <input
                            id="color"
                            name="color"
                            required
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                          />
                        </div>
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
                    Add
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
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
};
