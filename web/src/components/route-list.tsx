import { Route, Set } from '../types/routes';
import { useEffect, useState } from 'react';
import { colors, colorsBorder } from '../types/colors';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/solid';
import { useRoutes } from '../features/routes/api/get-routes';
import { useCircuits } from '../features/circuits/api/get-circuits';
import { useSets } from '../features/sets/api/get-sets';
import { useClimbs } from '../features/climbs/api/get-climbs';
import { useProjects } from '../features/projects/api/get-projects';
import { useSidebarState } from './ui/sidebar/sidebar-state';
import {
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from '@headlessui/react';
import { cmpStringsWithNumbers } from '@/utils/sort';

export function RouteList() {
  const routes = useRoutes().data || {};
  const sets = useSets().data || {};
  const climbs = useClimbs().data ?? [];
  const projects = useProjects().data ?? [];
  const circuits = useCircuits().data?.data ?? {};
  const circuitsOrder = useCircuits().data?.order ?? [];

  const [sortType, setSortType] = useState(() => {
    const savedSortType = localStorage.getItem('sortType');
    return savedSortType ? JSON.parse(savedSortType) : sort_types[0];
  });

  useEffect(() => {
    localStorage.setItem('sortType', JSON.stringify(sortType));
  }, [sortType]);

  let sent_ids: string[] = [];
  if (climbs != undefined) {
    sent_ids = climbs
      .filter((climb) => climb.sent == true)
      .map((climb) => climb.route);
  }

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
    <div className="bg-gray-50 pt-2 max-w-2xl mx-auto">
      <div className="mx-6 mb-0">
        <FilterBy selected={sortType} setSelected={setSortType} />
      </div>

      <div className={'mx-4 mb-8'}>
        {projects.length > 0 ? (
          <RouteDropDown
            name={'Your Projects'}
            sent_ids={sent_ids}
            routes={Object.values(routes)
              .filter((route) => projects.includes(route.id))
              .sort((a, b) => {
                if (sortType.id == 1) {
                  return cmpStringsWithNumbers(a.name, b.name);
                } else if (sortType.id == 2) {
                  return sent_ids.includes(a.id) ? -1 : 1;
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
              sent_ids={sent_ids}
              routes={Object.values(routes)
                .filter((route) => route.set_id === active_sets[circuit.id]?.id)
                .sort((a, b) => {
                  if (sortType.id == 1) {
                    return cmpStringsWithNumbers(a.name, b.name);
                  } else if (sortType.id == 2) {
                    return sent_ids.includes(a.id) ? -1 : 1;
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
              color={colors[circuit.color] || ''}
            />
          ))}
      </div>
    </div>
  );
}

function RouteDropDown({
  routes,
  sent_ids,
  name,
  color,
}: {
  routes: Route[];
  sent_ids: string[];
  name: string;
  color: string;
}) {
  const [open, setOpen] = useState(false);
  const circuits = useCircuits().data?.data ?? {};
  const sets = useSets().data || {};
  const { openSidebar } = useSidebarState();

  return (
    <>
      <div key={'projects'} className={'mt-3'}>
        <button
          className="bg-white hover:bg-gray-50 text-gray-700 font-medium shadow-md text-sm  rounded-lg w-full text-left justify-between items-center p-4"
          onClick={() => {
            setOpen((prev) => !prev);
          }}
        >
          <div className="flex">
            <div
              className={`uppercase text-white rounded-xl py-1 px-3 shadow-lg font-semibold ${color}`}
            >
              {name}
            </div>
            <div className="ml-auto">
              {' '}
              {
                Object.values(routes).filter((route) =>
                  sent_ids.includes(route.id),
                ).length
              }{' '}
              / {Object.values(routes).length}
            </div>
          </div>
          <div className="flex mt-3">
            <div className="w-full bg-gray-200 rounded-full h-5 dark:bg-gray-300">
              <div
                className={` h-5 rounded-full bg-linear-to-r  ${color}`}
                style={{
                  width: `${
                    (Object.values(routes).filter((route) =>
                      sent_ids.includes(route.id),
                    ).length /
                      Object.values(routes).length) *
                    100
                  }%`,
                }}
              ></div>
            </div>
          </div>
          {/* <div className="flex items-center w-full">
            <span
              className={`text-lg font-bold text-white uppercase px-4 py-2 pr-10 min-w-52 rounded-l-lg clip-path ${color}`}
            >
              {name}
            </span>
            <span className={'font-bold ml-auto mr-2'}>
              {
                Object.values(routes).filter((route) =>
                  sent_ids.includes(route.id),
                ).length
              }{' '}
              / {Object.values(routes).length} Routes
            </span>
          </div>
          <ChevronRightIcon
            className={`h-5 w-5 mr-3 transform transition-transform ${
              open ? 'rotate-90' : ''
            }`}
          /> */}
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
                        {sent_ids.includes(route.id) ? (
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
    <Listbox value={selected} onChange={setSelected}>
      <div className="flex">
        <Label className="block py-1 text-sm/6 font-medium text-gray-900">
          Sort by
        </Label>
        <ListboxButton className="grid ml-auto cursor-default grid-cols-1 rounded-xl bg-white py-1 pr-1 pl-2 text-left text-gray-900  focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 text-sm/6">
          <span className="col-start-1 row-start-1 flex items-center gap-3 pr-6">
            {/* <img
              alt=""
              src={selected.avatar}
              className="size-5 shrink-0 rounded-full"
            /> */}
            <span className="block truncate">{selected.name}</span>
          </span>
          <ChevronUpDownIcon
            aria-hidden="true"
            className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4"
          />
        </ListboxButton>
      </div>
      <div className="relative mt-2">
        <ListboxOptions
          transition
          className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-hidden data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0 sm:text-sm"
        >
          {sort_types.map((sort_type) => (
            <ListboxOption
              disabled={sort_type.disabled}
              key={sort_type.id}
              value={sort_type}
              className="group relative cursor-default py-2 pr-9 pl-3 text-gray-900 select-none data-focus:bg-indigo-600 data-focus:text-white data-focus:outline-hidden  data-disabled:bg-gray-100 data-disabled:text-gray-400"
            >
              <div className="flex items-center">
                {/* <img
                  alt=""
                  src={person.avatar}
                  className="size-5 shrink-0 rounded-full"
                /> */}
                <span className="ml-3 block truncate font-normal group-data-selected:font-semibold">
                  {sort_type.name}
                </span>
              </div>

              <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600 group-not-data-selected:hidden group-data-focus:text-white">
                <CheckIcon aria-hidden="true" className="size-5" />
              </span>
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  );
}
