import { Route, Set } from '../types/routes';
import { useEffect, useState } from 'react';
import { colors, colorsBorder, colorsPastel } from '../types/colors';
import { useRoutes } from '../features/routes/api/get-routes';
import { useCircuits } from '../features/circuits/api/get-circuits';
import { useSets } from '../features/sets/api/get-sets';
import { useProjects } from '../features/projects/api/get-projects';
import { useSidebarState } from './ui/sidebar/sidebar-state';
import { cmpStringsWithNumbers } from '@/utils/sort';
import { useCurrentGym } from '@/features/gyms/store/current-gym';

export function RouteList() {
  const { current_gym } = useCurrentGym();
  const routes = useRoutes().data || {};
  const sets = useSets({ gym_id: current_gym || '' }).data || {};
  const projects = useProjects().data ?? [];
  const circuits = useCircuits({ gym_id: current_gym || '' }).data?.data ?? {};
  const circuitsOrder =
    useCircuits({ gym_id: current_gym || '' }).data?.order ?? [];

  const [sortType, setSortType] = useState(() => {
    const savedSortType = localStorage.getItem('sortType');
    return savedSortType ? JSON.parse(savedSortType) : sort_types[0];
  });

  useEffect(() => {
    localStorage.setItem('sortType', JSON.stringify(sortType));
  }, [sortType]);

  // let sent_ids: string[] = [];
  // if (climbs != undefined) {
  //   sent_ids = climbs
  //     .filter((climb) => climb.sent == true)
  //     .map((climb) => climb.route);
  // }

  if (circuits == undefined) {
    return <div> Loading </div>;
  }

  const active_sets = Object.values(sets).reduce((acc, set) => {
    if (
      !acc[set.circuit_id] ||
      new Date(set.date) > new Date(acc[set.circuit_id].date)
    ) {
      acc[set.circuit_id] = set;
    }
    return acc;
  }, {} as Record<string, Set>);

  return (
    <div className="pt-2 max-w-2xl mx-auto">
      <div className="mb-0">
        <FilterBy selected={sortType} setSelected={setSortType} />
      </div>

      <div className={'mb-8'}>
        {projects.length > 0 ? (
          <RouteDropDown
            name={'Your Projects'}
            routes={Object.values(routes)
              .filter((route) => projects.includes(route.id))
              .sort((a, b) => {
                if (sortType.id == 1) {
                  return cmpStringsWithNumbers(a.name, b.name);
                } else if (sortType.id == 2) {
                  return a.user_sends > b.user_sends ? -1 : 1;
                } else if (sortType.id == 3) {
                  return a.climb_count > b.climb_count ? -1 : 1;
                } else if (sortType.id == 4) {
                  return a.location.localeCompare(b.location);
                } else if (sortType.id == 5) {
                  return a.style
                    .split(',')[0]
                    .localeCompare(b.style.split(',')[0]);
                }

                return 0;
              })}
            color="bg-linear-to-r from-indigo-500 from-10% via-sky-500 via-40% to-emerald-500 to-100%"
          />
        ) : null}

        {circuitsOrder
          .map((circuit_id) => circuits[circuit_id])

          .map((circuit) => (
            <RouteDropDown
              name={circuit.name}
              routes={Object.values(routes)
                .filter((route) => route.set_id === active_sets[circuit.id]?.id)
                .sort((a, b) => {
                  if (sortType.id == 1) {
                    return cmpStringsWithNumbers(a.name, b.name);
                  } else if (sortType.id == 2) {
                    return a.user_sends > b.user_sends ? -1 : 1;
                  } else if (sortType.id == 3) {
                    return a.climb_count > b.climb_count ? -1 : 1;
                  } else if (sortType.id == 4) {
                    return a.location.localeCompare(b.location);
                  } else if (sortType.id == 5) {
                    return a.style
                      .split(',')[0]
                      .localeCompare(b.style.split(',')[0]);
                  }

                  return 0;
                })}
              key={circuit.id}
              color={colorsPastel[circuit.color] || ''}
            />
          ))}
      </div>
    </div>
  );
}

function RouteDropDown({
  routes,
  name,
  color,
}: {
  routes: Route[];
  name: string;
  color: string;
}) {
  const { current_gym } = useCurrentGym();
  const [open, setOpen] = useState(false);
  const circuits = useCircuits({ gym_id: current_gym || '' }).data?.data ?? {};
  const sets = useSets({ gym_id: current_gym || '' }).data || {};
  const { openSidebar } = useSidebarState();

  return (
    <>
      <div key={'projects'} className={'mt-4'}>
        <button
          className="bg-white hover:bg-gray-50 text-gray-700 font-medium shadow-lg shadow-gray-200/50 text-sm  rounded-xl w-full text-left justify-between items-center p-4"
          onClick={() => {
            setOpen((prev) => !prev);
          }}
        >
          <div className="flex">
            <div
              className={`uppercase text-white text-sm rounded-full py-1 px-3 font-semibold ${color}`}
            >
              {name}
            </div>
            <div className="ml-auto">
              {' '}
              {
                Object.values(routes).filter((route) => route.user_sends > 0)
                  .length
              }{' '}
              / {Object.values(routes).length}
            </div>
          </div>
          <div className="flex mt-3">
            <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-300">
              <div
                className={` h-3 rounded-full bg-linear-to-r  ${color}`}
                style={{
                  width: `${
                    (Object.values(routes).filter(
                      (route) => route.user_sends > 0,
                    ).length /
                      Object.values(routes).length) *
                    100
                  }%`,
                }}
              ></div>
            </div>
          </div>
        </button>
        {open && (
          <div className="ml mt-2" key={'projects'}>
            {Object.values(routes).map((route) => (
              <div
                key={route.id}
                onClick={() => openSidebar(route)}
                className="bg-white shadow-lg rounded-lg overflow-hidden sm:rounded-lg mt-2 cursor-pointer hover:bg-slate-50"
              >
                <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                  <div className="flex w-full items-center">
                    <img
                      className={`h-24 rounded-sm border-b-6 ${
                        colorsBorder[
                          circuits[sets[route.set_id]?.circuit_id]?.color
                        ]
                      }`}
                      src={'/api/img_thumb/' + route.id + '.webp'}
                      alt=""
                    ></img>
                    <div className="ml-4 w-full overflow-hidden">
                      <div className="flex w-full">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                          {route.name}
                        </h3>
                        {route.user_sends > 0 ? (
                          <span
                            className={
                              'ml-auto inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white ' +
                              (colors[
                                circuits[sets[route.set_id]?.circuit_id]
                                  ?.color || ''
                              ] || '')
                            }
                          >
                            Sent
                          </span>
                        ) : (
                          <div className={''}> </div>
                        )}
                      </div>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        {route.location}
                      </p>
                      <div className="flex gap-2 mt-1">
                        {route.style.split(',').map((style) => (
                          <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-gray-600">
                            {style}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

const sort_types = [
  {
    id: 1,
    name: 'Name',
    disabled: false,
  },
  {
    id: 2,
    name: 'Sent',
    disabled: false,
  },
  {
    id: 3,
    name: 'Most sent',
    disabled: false,
  },
  {
    id: 4,
    name: 'Location',
    disabled: false,
  },
  {
    id: 5,
    name: 'Style',
    disabled: false,
  },
];

export function FilterBy({
  selected,
  setSelected,
}: {
  selected: {
    id: number;
    name: string;
    disabled: boolean;
  };
  setSelected: (value: { id: number; name: string; disabled: boolean }) => void;
}) {
  return (
    <div className="flex px-2">
      <label
        htmlFor="sort-by"
        className="block py-1 text-md font-semibold text-gray-900"
      >
        Sort by
      </label>
      <select
        id="sort-by"
        value={selected.id}
        onChange={(e) =>
          setSelected(
            sort_types.find(
              (sort_type) => sort_type.id === Number(e.target.value),
            )!,
          )
        }
        className="ml-auto cursor-pointer font-semibold rounded-xl bg-none py-1 pr-1 pl-2 text-left text-blue-500 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-200 text-md"
      >
        {sort_types.map((sort_type) => (
          <option
            key={sort_type.id}
            value={sort_type.id}
            disabled={sort_type.disabled}
          >
            {sort_type.name}
          </option>
        ))}
      </select>
    </div>
  );
}
