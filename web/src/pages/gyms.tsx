import { useCircuits } from '@/features/circuits/api/get-circuits';
import { CreateCircuit } from '@/features/circuits/components/create-circuit';
import { DeleteCircuit } from '@/features/circuits/components/delete-circuit';
import { useGyms } from '@/features/gyms/api/get-gyms';
import { GymDropDown } from '@/features/gyms/components/gym-dropdown';
import { useCurrentGym } from '@/features/gyms/store/current-gym';
import { colors } from '@/types/colors';

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
          <h1 className="text-2xl font-bold text-gray-900">
            {gyms[current_gym].name}
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
