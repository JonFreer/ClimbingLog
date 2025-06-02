import { useState } from 'react';
import MapDraw from './map-draw';
import { Line } from './types';
import MapLocation from './map-location';

export default function MapPage() {
  const [lines, setLines] = useState<Line[]>([
    { joined: false, points: [], style: 'wall' },
  ]);
  const [stage, setStage] = useState(0);
  const [areas, setAreas] = useState([
    {
      joined: false,
      points: [],
      style: 'wall',
      color: '#ff00005e',
      name: 'Area 1',
    },
  ]);
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        <div className="h-full w-full">
          <h1 className="text-center text-xl font-bold">
            Configure Gym Layout
          </h1>

          {stage === 0 && <MapDraw lines={lines} setLines={setLines} />}
          {stage === 1 && (
            <MapLocation lines={lines} areas={areas} setAreas={setAreas} />
          )}

          <div className="flex flex-col items-center mt-4 space-y-4">
            {stage === 0 && (
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onClick={() => setStage(1)}
              >
                Define Areas
              </button>
            )}
            {stage === 1 && (
              <button
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
                onClick={() => setStage(2)}
              >
                Save Layout
              </button>
            )}
            <div className="text-sm text-gray-500">
              {stage === 0 && 'Step 1: Start by drawing the layout.'}
              {stage === 1 && 'Step 2: Define the areas within the layout.'}
              {stage === 2 && 'Step 3: Save your configuration.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
