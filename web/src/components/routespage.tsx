import { useEffect, useState } from 'react';
import { Circuit, Set } from '../types/routes';
import { RouteList } from './route-list';
import DraggableDotsCanvas from './map';
import {
  colors,
  colorsBold,
  colorsFaint,
  colorsHex,
  colorsTextBold,
} from '../types/colors';
import { RouteCard } from './route-card';
import { useRoutes } from '../features/routes/api/get-routes';
import { useCircuits } from '../features/circuits/api/get-circuits';
import { useSets } from '../features/sets/api/get-sets';
import { useClimbs } from '../features/climbs/api/get-climbs';
import { useProjects } from '../features/projects/api/get-projects';
import { Checkbox, Menu, MenuButton, MenuItems } from '@headlessui/react';
import { useCurrentGym } from '@/features/gyms/store/current-gym';

export function RoutesPage() {
  const { current_gym } = useCurrentGym();
  const routes = useRoutes().data || {};
  const sets = useSets({ gym_id: current_gym || '' }).data ?? {};
  const circuits = useCircuits({ gym_id: current_gym || '' }).data?.data ?? {};
  const circuitsOrder =
    useCircuits({ gym_id: current_gym || '' }).data?.order ?? [];
  const climbs = useClimbs().data ?? [];
  const projects = useProjects().data ?? [];
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [filterCircuits, setFilterCircuits] = useState<{
    [key: string]: boolean;
  }>(() => {
    const filterCircuits = localStorage.getItem('filterCircuits');
    return filterCircuits ? JSON.parse(filterCircuits) : {};
  });

  const [filterState, setFilterState] = useState<{
    sent: boolean;
    attempted: boolean;
    notAttempted: boolean;
  }>({
    sent: true,
    attempted: true,
    notAttempted: true,
  });

  useEffect(() => {
    localStorage.setItem('filterCircuits', JSON.stringify(filterCircuits));
  }, [filterCircuits]);

  const anyFitlered = Object.values(filterCircuits).some(
    (circuit) => circuit == true,
  );

  const active_sets = Object.values(sets).reduce((acc, set) => {
    if (
      !acc[set.circuit_id] ||
      new Date(set.date) > new Date(acc[set.circuit_id].date)
    ) {
      acc[set.circuit_id] = set;
    }
    return acc;
  }, {} as Record<string, Set>);

  const selectedRouteData = routes[selectedRoute] || null;

  return (
    <div className="sm:mb-8 mb-16 relative px-4">
      <MapFilter filterState={filterState} setFilterState={setFilterState} />
      <div className="shadow-xl shadow-slate-200/60 z-10 mb-4 bg-white rounded-3xl ">
        <DraggableDotsCanvas
          dots={
            Object.values(routes)
              .filter(
                (route) =>
                  sets[route.set_id] &&
                  active_sets[sets[route.set_id].circuit_id].id ==
                    route.set_id &&
                  (filterCircuits[sets[route.set_id].circuit_id] ||
                    !anyFitlered ||
                    (filterCircuits['projects'] &&
                      projects.some((project) => project === route.id))),
              )
              .filter((route) =>
                filterState.sent
                  ? true
                  : climbs.filter(
                      (climb) => climb.route === route.id && climb.sent,
                    ).length == 0,
              )
              .filter((route) =>
                filterState.attempted
                  ? true
                  : climbs.filter((climb) => climb.route === route.id).length ==
                    0,
              )
              .map((route) => ({
                id: route.id,
                x: route.x,
                y: route.y,
                isDragging: false,
                complete:
                  climbs.filter(
                    (climb) => climb.route === route.id && climb.sent,
                  ).length == 0,
                radius: 4,
                draggable: false,
                color:
                  colorsHex[
                    circuits[sets[route.set_id].circuit_id]?.color || 'black'
                  ],
              })) || []
          }
          gym_id={current_gym || ''}
          selected_id={selectedRoute}
          updateDots={() => {}}
          setSelected={setSelectedRoute}
        />
      </div>

      <FilterCircuits
        circuits={circuits}
        circuitsOrder={circuitsOrder}
        filterCircuits={filterCircuits}
        setFilterCircuits={setFilterCircuits}
      />

      {selectedRoute && selectedRouteData ? (
        <RouteCard
          route={selectedRouteData}
          circuits={circuits}
          sets={sets}
          climbs={climbs}
        />
      ) : (
        ''
      )}

      <RouteList />
    </div>
  );
}

function FilterCircuits({
  circuits,
  circuitsOrder,
  filterCircuits,
  setFilterCircuits,
}: {
  circuits: Record<string, Circuit>;
  circuitsOrder: string[];
  filterCircuits: { [key: string]: boolean };
  setFilterCircuits: (prev: any) => any;
}) {
  return (
    <div className="flex flex-wrap gap-2 justify-center h-full z-1">
      {circuitsOrder
        .map((circuit_id) => circuits[circuit_id])
        .map((circuit) =>
          filterCircuits[circuit.id] ? (
            <button
              key={circuit.id}
              className={
                'cursor-pointer rounded-full px-3 py-1 font-semibold text-sm text-white ' +
                (colors[circuit.color] || '') +
                ' hover:' +
                (colorsBold[circuit.color] || '')
              }
              onClick={() =>
                setFilterCircuits((prev) => ({
                  ...prev,
                  [circuit.id]: false,
                }))
              }
            >
              {circuit.name}
            </button>
          ) : (
            <button
              key={circuit.id}
              className={
                `cursor-pointer rounded-full px-3 py-1 text-sm font-semibold  ${
                  colorsTextBold[circuit.color]
                } ` + (colorsFaint[circuit.color] || '')
              }
              onClick={() =>
                setFilterCircuits((prev) => ({ ...prev, [circuit.id]: true }))
              }
            >
              {circuit.name}
            </button>
          ),
        )}

      <button
        key={'projects'}
        className={
          filterCircuits['projects']
            ? 'cursor-pointer rounded-full px-3 py-1 text-sm font-semibold text-white bg-linear-to-r from-indigo-500 from-10% via-sky-500 via-40% to-emerald-500 to-100%'
            : 'cursor-pointer rounded-full px-3 py-1 text-sm font-semibold text-indigo-800 bg-linear-to-r from-indigo-200 from-10% via-sky-200 via-40% to-emerald-200 to-100%'
        }
        onClick={() => {
          setFilterCircuits((prev) => ({
            ...prev,
            ['projects']: !filterCircuits['projects'],
          }));
        }}
      >
        Projects
      </button>
    </div>
  );
}

function MapFilter({
  filterState,
  setFilterState,
}: {
  filterState: { sent: boolean; attempted: boolean; notAttempted: boolean };
  setFilterState: (prev: any) => any;
}) {
  return (
    <Menu>
      <MenuButton
        className={
          'absolute top-5 right-8 size-12 z-1 rounded-full bg-white shadow-lg hover:bg-gray-50 cursor-pointer flex items-center justify-center text-gray-600'
        }
      >
        <span className="absolute -inset-1.5" />
        <span
          style={{ fontVariationSettings: "'FILL' 1" }}
          className="material-symbols-rounded"
        >
          tune
        </span>

        {/* <AdjustmentsHorizontalIcon className="size-6 tes" /> */}
      </MenuButton>
      {!filterState.sent ||
      !filterState.attempted ||
      !filterState.notAttempted ? (
        <div className="absolute top-5  z-1 right-5 h-3 w-3  bg-orange-600 rounded-full"></div>
      ) : null}
      <MenuItems
        transition
        className="absolute right-7 mt-10 pt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
      >
        <div className="px-4 py-2 text-sm text-gray-700 font-semibold">
          Filter
        </div>
        <div className="py-1">
          <button
            className="flex px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden w-full hover:bg-gray-100"
            onClick={() => {
              setFilterState((prev) => ({
                ...prev,
                sent: !prev.sent,
              }));
            }}
          >
            Sent
            <Checkbox
              checked={filterState.sent}
              className="ml-auto group block size-4 rounded border bg-white data-checked:bg-blue-500"
            >
              {/* Checkmark icon */}
              <svg
                className="stroke-white opacity-0 group-data-checked:opacity-100"
                viewBox="0 0 14 14"
                fill="none"
              >
                <path
                  d="M3 8L6 11L11 3.5"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Checkbox>
          </button>
          <button
            className="flex px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden w-full hover:bg-gray-100"
            onClick={() => {
              setFilterState((prev) => ({
                ...prev,
                attempted: !prev.attempted,
              }));
            }}
          >
            Attempted
            <Checkbox
              checked={filterState.attempted}
              className="ml-auto group block size-4 rounded border bg-white data-checked:bg-blue-500"
            >
              {/* Checkmark icon */}
              <svg
                className="stroke-white opacity-0 group-data-checked:opacity-100"
                viewBox="0 0 14 14"
                fill="none"
              >
                <path
                  d="M3 8L6 11L11 3.5"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Checkbox>
          </button>
        </div>
      </MenuItems>
    </Menu>
  );
}
