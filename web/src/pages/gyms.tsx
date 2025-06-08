import { useCircuits } from '@/features/circuits/api/get-circuits';
import { CreateCircuit } from '@/features/circuits/components/create-circuit';
import { DeleteCircuit } from '@/features/circuits/components/delete-circuit';
import { useGyms } from '@/features/gyms/api/get-gyms';
import { EditGymImage } from '@/features/gyms/components/edit-gym-image';
import { EditGymInfo } from '@/features/gyms/components/edit-gym-info';
import { GymDropDown } from '@/features/gyms/components/gym-dropdown';
import { useCurrentGym } from '@/features/gyms/store/current-gym';
import { colors } from '@/types/colors';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { EllipsisVerticalIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';

export function GymsPage() {
  const gyms = useGyms().data || {};
  const { current_gym } = useCurrentGym();
  const circuits = useCircuits({ gym_id: current_gym || '' }).data?.data || {};

  if (current_gym == undefined) {
    return (
      <div className="mx-2 py-15">
        <div className="px-4 sm:px-2 ">
          <div className="flex items-center justify-between mx-auto">
            <GymDropDown />
          </div>
          <p className="mt-1 max-w-2xl text-sm/6 text-gray-500">
            No gyms selected.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="mx-2 py-15">
      <div className="px-4 sm:px-2 ">
        <div className="flex items-centerjustify-between mx-auto">
          <GymDropDown />
        </div>

        <div className="mt-4">
          <h1 className="text-2xl font-bold text-gray-900 flex justify-between">
            <div>{gyms[current_gym].name}</div>
            <EditMenu />
          </h1>
          <p className="mt-1 max-w-2xl text-sm/6 text-gray-500">
            {gyms[current_gym].location}
          </p>
          <p className="mt-1 max-w-2xl text-sm/6 text-gray-500">
            {gyms[current_gym].about}
          </p>
          <div className="mt-4"></div>
        </div>
      </div>
      <div className="flex items-center">
        <span className="font-bold text-2xl mt-4">Circuits</span>
        <CreateCircuit gym_id={current_gym} />
      </div>

      <div>
        {Object.values(circuits).map((circuit) => (
          <div
            key={circuit.id}
            className="flex items-center w-full shadow-sm rounded-lg mt-2"
          >
            <span
              className={
                'text-lg font-bold text-white uppercase px-2 py-2 pr-10 w-52 text-center rounded-l-lg clip-path truncate ' +
                (colors[circuit.color] || '')
              }
            >
              {circuit.name}
            </span>
            <span className="p-2">{circuit.name}</span>
            <DeleteCircuit circuit_id={circuit.id} />
          </div>
        ))}
      </div>
    </div>
  );
}

function EditMenu() {
  const [editInfoOpen, setEditInfoOpen] = useState(false);
  const [editImageOpen, setEditImageOpen] = useState(false);
  return (
    <>
      <EditGymInfo setOpen={setEditInfoOpen} open={editInfoOpen} />
      <EditGymImage setOpen={setEditImageOpen} open={editImageOpen} />

      <Menu as="div" className="relative ml-3">
        <div>
          <MenuButton className="relative flex rounded-full bg-none text-sm focus:outline-hidden focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-500">
            <span className="absolute -inset-1.5" />
            <span className="sr-only">Open user menu</span>
            <EllipsisVerticalIcon
              aria-hidden="true"
              className="size-6 text-gray-600"
            />
          </MenuButton>
        </div>
        <MenuItems
          transition
          className="font-medium absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-leave:duration-75 data-enter:ease-out data-leave:ease-in"
        >
          <MenuItem>
            <div
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 data-focus:outline-hidden cursor-pointer"
              onClick={() => setEditInfoOpen(true)}
            >
              Edit Gym Info
            </div>
          </MenuItem>
          <MenuItem>
            <div
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 data-focus:outline-hidden cursor-pointer"
              onClick={() => setEditImageOpen(true)}
            >
              Edit Gym Image
            </div>
          </MenuItem>
          <MenuItem>
            <div className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 data-focus:outline-hidden cursor-pointer">
              Edit Gym Shape
            </div>
          </MenuItem>
          <MenuItem>
            <div className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 data-focus:outline-hidden cursor-pointer">
              Edit Gym Areas
            </div>
          </MenuItem>
        </MenuItems>
      </Menu>
    </>
  );
}
