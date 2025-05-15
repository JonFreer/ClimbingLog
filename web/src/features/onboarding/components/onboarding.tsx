import { ImageUploadProfilePic } from '@/components/settings';
import { useUpdateUser } from '@/features/user/api/update-user';
import { useUser } from '@/lib/auth';
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

  return (
    <div className="flex flex-col p-8">
      <h1 className="font-semibold text-2xl">Welcome to VolumeDB</h1>
      <p>Let's get your account set up.</p>
      <div className="col-span-full pt-8">
        <label
          htmlFor="about"
          className="block text-sm/6 font-medium text-gray-900"
        >
          Profile Picture
        </label>
        <p className="mt-1 text-sm/6 text-gray-600">
          Add an image of yourself to your profile. This will be visible to
          others.
        </p>

        <ImageUploadProfilePic
          imageCallback={(image) => console.log(image)}
          defaultUrl={''}
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
          <label
            htmlFor="about"
            className="block text-sm/6 font-medium text-gray-900"
          >
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
