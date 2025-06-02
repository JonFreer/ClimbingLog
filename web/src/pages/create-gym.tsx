import MapDraw from '@/components/ui/map/map-draw';
import MapLocation, { Area } from '@/components/ui/map/map-location';
import { Line } from '@/components/ui/map/types';
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
  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:mb-8 mb-14">
      <div className="max-w-3xl mx-auto bg-white rounded-xl relative shadow-xl p-5">
        <div className="mt-4">
          {stage === 0 && (
            <>
              <div className="text-xl font-bold">Create New Gym</div>

              <BasicInfo />
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
                    setStage(3);
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

function BasicInfo() {
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
          className="mt-1 p-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Enter gym name"
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
        ></textarea>
      </div>
    </form>
  );
}
