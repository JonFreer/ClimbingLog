import { useEffect } from 'react';
import { useGyms } from '../api/get-gyms';
import { useCurrentGym } from '../store/current-gym';
import {
  Popover,
  PopoverBackdrop,
  PopoverButton,
  PopoverPanel,
} from '@headlessui/react';
import { HomeIcon } from '@heroicons/react/24/solid';
import { useUser } from '@/lib/auth';

export function GymDropDown() {
  const gyms = useGyms().data || {};
  const { current_gym, setCurrentGym } = useCurrentGym();
  const user = useUser();
  useEffect(() => {
    if (Object.keys(gyms).length > 0 && !current_gym) {
      const firstGymId = Object.keys(gyms)[0];
      setCurrentGym(firstGymId);
    }
  }, [gyms, current_gym, setCurrentGym]);

  if (!current_gym) {
    return <></>;
  }

  return (
    <Popover className="flex px-2">
      <PopoverButton className="flex ml-auto cursor-pointer font-semibold rounded-xl px-2 bg-none focus:outline-2 focus:-outline-offset-2 focus:outline-blue-200 text-md">
        <img
          src={`/api/gyms/${current_gym}/image`}
          className="size-8 bg-white rounded-full mr-4"
        />
        <div className="text-md/8 pt-1">{gyms[current_gym || ''].name}</div>
      </PopoverButton>
      <PopoverBackdrop className="fixed inset-0 bg-black/15 z-100" />
      <PopoverPanel
        transition
        className="absolute max-w-100 mx-auto inset-x-0 -top-10 origin-top rounded-b-2xl bg-gray-50 px-6 pt-15 pb-6 shadow-2xl shadow-gray-900/20
              transition duration-200 ease-out data-closed:scale-95 data-closed:opacity-0 z-120 animate-[bounce-down_0.5s_ease-out]"
        style={{
          animation: 'bounce-down 0.4s ease-out',
        }}
      >
        {({ close }) => (
          <div className="max-w-80 mx-auto w-full font-semibold text-gray-700 ">
            <div className="flex mx-auto justify-center mb-6">
              <img
                src={`/api/gyms/${current_gym}/image`}
                className="size-8 bg-white rounded-full mr-4"
              />
              <div className="text-md/8 pt-1">
                {gyms[current_gym || ''].name}
              </div>
            </div>
            {Object.values(gyms).map((gym) => (
              <button
                className="flex hover:bg-gray-100 p-2 rounded w-full cursor-pointer text-left"
                onClick={() => {
                  setCurrentGym(gym.id);
                  close();
                }}
              >
                <img
                  src={`/api/gyms/${gym.id}/image`}
                  className="size-8 bg-white rounded-full m-2 mr-4"
                />
                <div>
                  <div className="text-gray-700 font-semibold relative">
                    {gym.name}
                  </div>
                  <div className="text-gray-500">{gym.location}</div>
                </div>
                {gym.id == user.data?.home_gym ? (
                  <HomeIcon className="size-6 m-3 ml-auto text-gray-400"></HomeIcon>
                ) : (
                  <></>
                )}
              </button>
            ))}
          </div>
        )}
      </PopoverPanel>
    </Popover>
  );
}
