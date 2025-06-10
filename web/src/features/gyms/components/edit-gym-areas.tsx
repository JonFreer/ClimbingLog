import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { useGyms } from '../api/get-gyms';
import { useEditGym } from '../api/update-gym';
import { useCurrentGym } from '../store/current-gym';
import { useState } from 'react';
import MapLocation from '@/components/ui/map/map-location';

export function EditGymAreas({
  setOpen,
  open,
}: {
  setOpen: (open: boolean) => void;
  open: boolean;
}) {
  const { current_gym } = useCurrentGym();
  const gym = useGyms().data?.[current_gym || ''];
  const [areas, setAreas] = useState(gym?.layout?.areas || []);

  const editGymMutation = useEditGym({
    mutationConfig: {
      onSuccess: () => {
        setOpen(false);
      },
    },
  });
  // Placeholder for the edit gym info functionality
  return (
    <>
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
          <div className="flex pt-15 pb-30 min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="my-auto relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-leave:duration-200 data-enter:ease-out data-leave:ease-in sm:w-full sm:max-w-lg sm:data-closed:translate-y-0 sm:data-closed:scale-95"
            >
              <form
                className="space-y-6 w-full"
                onSubmit={(e) => {
                  e.preventDefault();

                  editGymMutation.mutate({
                    gym_id: current_gym || '',
                    data: {
                      layout: JSON.stringify({
                        lines: gym?.layout?.lines || [],
                        areas: areas,
                      }),
                    },
                  });
                }}
              >
                <MapLocation
                  lines={gym?.layout.lines || []}
                  areas={areas}
                  setAreas={setAreas}
                />
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="submit"
                    //   onClick={() => props.setOpen("")}
                    className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-green-500 sm:ml-3 sm:w-auto"
                  >
                    Save
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
}
