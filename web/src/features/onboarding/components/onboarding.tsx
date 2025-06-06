import { ImageUploadProfilePic } from '@/components/settings';
import { useGyms } from '@/features/gyms/api/get-gyms';
import { useUpdateUser } from '@/features/user/api/update-user';
import { useUser } from '@/lib/auth';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

export default function Onboarding() {
  const user = useUser();
  const navigate = useNavigate();
  const updateUserMutation = useUpdateUser({
    mutationConfig: {
      onSuccess: () => {
        navigate('/');
      },
    },
  });
  const [homeGym, setHomeGym] = useState<string | null>(null);

  return (
    <div className="flex flex-col p-8">
      <h1 className="font-semibold text-2xl">Welcome to VolumeDB</h1>
      <p>Let's get your account set up.</p>

      <div className="col-span-full pt-8 font-bold text-md text-gray-700">
        <div className=" mb-4">Home Gym</div>
        <HomeGymPicker setHomeGym={setHomeGym} homeGym={homeGym} />
      </div>
      <div className="col-span-full pt-8">
        <label htmlFor="about" className="block font-bold text-gray-700">
          Profile Picture
        </label>

        <ImageUploadProfilePic
          imageCallback={(image) => console.log(image)}
          defaultUrl={
            user.data?.has_profile_photo
              ? `/api/profile_photo/${user.data.id}`
              : ''
          }
        />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateUserMutation.mutate({
            data: {
              about: e.target.about.value,
              username: user?.data.username,
              send_visible: user?.data.send_visible,
              profile_visible: user?.data.profile_visible,
            },
          });
        }}
      >
        <div className="col-span-full">
          <label htmlFor="about" className="block font-bold text-gray-700">
            About
          </label>
          <p className="mt-1 text-sm/6 text-gray-600">
            Write a few sentences about yourself. This will be displayed on your
            profile.
          </p>

          <div className="mt-2">
            <textarea
              id="about"
              name="about"
              rows={3}
              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
              defaultValue={user?.data.about}
            />
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-x-6">
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Let's Go!
          </button>
        </div>
      </form>
    </div>
  );
}

function HomeGymPicker({
  setHomeGym,
  homeGym,
}: {
  setHomeGym: (gymId: string | null) => void;
  homeGym: string | null;
}) {
  const gyms = useGyms().data || {};
  const [open, setOpen] = useState(false);
  return (
    <>
      {homeGym ? (
        <button
          className="w-full bg-white flex p-2 cursor-pointer font-semibold rounded-xl px-2 bg-none focus:outline-2 focus:-outline-offset-2 focus:outline-blue-200 text-md"
          onClick={() => setOpen(true)}
        >
          <>
            <img
              src={`/api/gyms/${gyms[homeGym].id}/image`}
              className="size-8 bg-amber-600 rounded-full m-2 mr-4"
            />
            <div className="text-left">
              <div className="text-gray-700 font-semibold relative">
                {gyms[homeGym].name}
              </div>
              <div className="text-gray-500">{gyms[homeGym].location}</div>
            </div>
          </>
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="relative inline-flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <span>Select home gym</span>
          <svg
            className="w-5 h-5 text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06 0L10 10.92l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 010-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        className="relative z-150"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-leave:duration-200 data-enter:ease-out data-leave:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full  justify-center text-center items-center p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-leave:duration-200 data-enter:ease-out data-leave:ease-in my-8 w-[90%] sm:max-w-lg sm:data-closed:translate-y-0 sm:data-closed:scale-95"
            >
              <div className="w-full bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="w-full sm:flex sm:items-start">
                  <div className="mt-0 w-full text-left sm:ml-4 sm:mt-0 sm:text-left">
                    <div className="mt-2 w-full divide-y divide-gray-100">
                      {Object.values(gyms).map((gym) => (
                        <button
                          key={gym.id}
                          className="flex hover:bg-gray-100 p-2 rounded w-full cursor-pointer text-left"
                          onClick={() => {
                            setHomeGym(gym.id);
                            setOpen(false);
                          }}
                        >
                          <img
                            src={`/api/gyms/${gym.id}/image`}
                            className="size-8 bg-amber-600 rounded-full m-2 mr-4"
                          />
                          <div>
                            <div className="text-gray-700 font-semibold relative">
                              {gym.name}
                            </div>
                            <div className="text-gray-500">{gym.location}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}
