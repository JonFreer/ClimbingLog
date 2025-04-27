import { useNotifications } from "../../../components/ui/notifications";
import { useCreateSet } from "../api/create-set";

import { useCircuits } from "../../circuits/api/get-circuits";
import { colors } from "../../../types/colors";
import { useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";

type CreateSetProps = {
  circuit_id: string;
};

export const CreateSet = ({ circuit_id }: CreateSetProps) => {
  const [open, setOpen] = useState(false);
  const circuits = useCircuits().data || {};  

  const { addNotification } = useNotifications();

  const createSetMutation = useCreateSet({
    mutationConfig: {
      onSuccess: () => {
        addNotification({
          type: "success",
          title: "Set Created",
        });
        setOpen(false);
      },
    },
  });

  return (
    <>
      <span
        className={
          "ml-2 px-2 text-sm py-2 rounded-lg font-bold text-white cursor-pointer " +
          (circuits[circuit_id]
            ? colors[circuits[circuit_id].color]
            : "")
        }
        onClick={() => {
          setOpen(true);
        }}
      >
        New Set
      </span>
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
                className="space-y-6 w-full"
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  const data = Object.fromEntries(formData.entries());
                  console.log("Create Set Values", data);
                  createSetMutation.mutate({
                    data: {
                      name: data.name as string,
                      date: data.date as string,
                      circuit_id: circuit_id,
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
                        Add a new set
                      </DialogTitle>
                      <div className="mt-2 mb-4"></div>
                      <div>
                        <div className="flex items-center justify-between">
                          <label
                            htmlFor="name"
                            className="block text-sm/6 font-medium text-gray-900"
                          >
                            Set Name
                          </label>
                        </div>
                        <div className="mt-2">
                          <input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Optional"
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            // onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <label
                            htmlFor="color"
                            className="block text-sm/6 font-medium text-gray-900"
                          >
                            Date of reset
                          </label>
                        </div>
                        <div className="mt-2">
                          <input
                            id="date"
                            name="date"
                            type="date"
                            defaultValue={
                              new Date().toISOString().split("T")[0]
                            }
                            required
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            // onChange={handleChange}
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
