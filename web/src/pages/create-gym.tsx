import { ImageSelect } from '@/components/ui/form/image-select';
import MapDraw from '@/components/ui/map/map-draw';
import MapLocation from '@/components/ui/map/map-location';
import { Notification, useNotifications } from '@/components/ui/notifications';
import { useCreateGym } from '@/features/gyms/api/create-gym';
import { Area, Line } from '@/types/gym';
import { useState } from 'react';

export default function CreateGym() {
  const [lines, setLines] = useState<Line[]>([
    { joined: false, points: [], style: 'wall' },
  ]);
  const [stage, setStage] = useState(0);
  const [areas, setAreas] = useState<Area[]>([
    {
      joined: false,
      points: [],
      style: 'wall',
      color: '#ff00005e',
      name: 'Area 1',
    },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    about: '',
    file: '',
  });

  const { addNotification } = useNotifications();

  const createGymMutation = useCreateGym({
    mutationConfig: {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'Gym Created',
        } as Notification);
      },
    },
  });

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:mb-8 mb-14">
      <div className="max-w-3xl mx-auto bg-white rounded-xl relative shadow-xl p-5">
        <div className="mt-4">
          {stage === 0 && (
            <>
              <div className="text-xl font-bold">Create New Gym</div>

              <BasicInfo formData={formData} setFormData={setFormData} />
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={(e) => {
                  e.preventDefault();
                  setStage(1);
                }}
              >
                Next: Add layout
              </button>
            </>
          )}
          {stage === 1 && (
            <>
              <h2 className="text-lg font-semibold mb-4">Draw Gym Layout</h2>
              <MapDraw lines={lines} setLines={setLines} />
              <div className="flex w-full gap-4">
                <button
                  type="submit"
                  className=" bg-indigo-600 text-white py-2 px-6 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={(e) => {
                    e.preventDefault();
                    setStage(0); // Change to setStage(0) to go back to Basic Info
                  }}
                >
                  Back
                </button>{' '}
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={(e) => {
                    e.preventDefault();
                    setStage(2);
                  }}
                >
                  Next: Add locations
                </button>
              </div>
            </>
          )}
          {stage === 2 && (
            <>
              <h2 className="text-lg font-semibold mb-4">
                Add Locations to map
              </h2>
              <MapLocation lines={lines} areas={areas} setAreas={setAreas} />
              <div className="flex w-full gap-4">
                <button
                  type="submit"
                  className=" bg-indigo-600 text-white py-2 px-6 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={(e) => {
                    e.preventDefault();
                    setStage(1); // Change to setStage(0) to go back to Basic Info
                  }}
                >
                  Back
                </button>{' '}
                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  onClick={(e) => {
                    e.preventDefault();
                    console.log(formData.file);
                    createGymMutation.mutate({
                      data: {
                        ...formData,
                        layout: JSON.stringify({ lines, areas }),
                      },
                    });
                  }}
                >
                  Create!
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function BasicInfo({
  formData,
  setFormData,
}: {
  formData: any;
  setFormData: (data: any) => void;
}) {
  return (
    <form className="mt-4 space-y-4">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          className="mt-1 p-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Enter gym name"
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>
      <div>
        <label
          htmlFor="location"
          className="block text-sm font-medium text-gray-700"
        >
          Location
        </label>
        <input
          type="text"
          id="location"
          name="location"
          className="mt-1 p-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Birmingham, UK"
          onChange={(e) =>
            setFormData({ ...formData, location: e.target.value })
          }
          value={formData.location}
        />
      </div>
      <div>
        <label
          htmlFor="about"
          className="block text-sm font-medium text-gray-700"
        >
          About
        </label>
        <textarea
          id="about"
          name="about"
          rows={4}
          className="mt-1 p-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Write about the gym"
          onChange={(e) => setFormData({ ...formData, about: e.target.value })}
          value={formData.about}
        ></textarea>
      </div>

      <ImageSelect
        defaultUrl=""
        imageCallback={(file) => setFormData({ ...formData, file: file })}
      />
    </form>
  );
}
