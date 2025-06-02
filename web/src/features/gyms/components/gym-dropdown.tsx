import { useGyms } from '../api/get-gyms';
import { useCurrentGym } from '../store/current-gym';

export function GymDropDown() {
  const gyms = useGyms().data || {};
  const { current_gym, setCurrentGym } = useCurrentGym();
  return (
    <div className="flex px-2">
      <select
        id="sort-by"
        value={current_gym || ''}
        onChange={(e) => setCurrentGym(e.target.value)}
        className="ml-auto cursor-pointer font-semibold rounded-xl bg-none py-2 pr-2 pl-3 text-left  focus:outline-2 focus:-outline-offset-2 focus:outline-blue-200 text-md"
      >
        {Object.keys(gyms).map((gymId) => (
          <option key={gymId} value={gymId}>
            {gyms[gymId].name}
          </option>
        ))}
      </select>
    </div>
  );
}
