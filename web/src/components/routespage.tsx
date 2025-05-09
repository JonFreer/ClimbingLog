import { useEffect, useState } from "react";
import { Set } from "../types/routes";
import { RouteList } from "./route-list";
import DraggableDotsCanvas from "./map";
import { colors, colorsBold, colorsFaint, colorsHex } from "../types/colors";
import { RouteCard } from "./route-card";
import RouteSideBar from "./ui/sidebar/route-sidebar";
import { useRoutes } from "../features/routes/api/get-routes";
import { useCircuits } from "../features/circuits/api/get-circuits";
import { useSets } from "../features/sets/api/get-sets";
import { useClimbs } from "../features/climbs/api/get-climbs";
import { useProjects } from "../features/projects/api/get-projects";
import { useSidebarState } from "./ui/sidebar/sidebar-state";

export function RoutesPage() {
  const routes = useRoutes().data || {};
  const sets = useSets().data ?? {};
  const circuits = useCircuits().data?.data ?? {};
  const circuitsOrder = useCircuits().data?.order ?? [];
  const climbs = useClimbs().data ?? [];
  const projects = useProjects().data ?? [];
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [filterCircuits, setFilterCircuits] = useState<{
    [key: string]: boolean;
  }>(() => {
    const filterCircuits = localStorage.getItem("filterCircuits");
    return filterCircuits ? JSON.parse(filterCircuits) : {};
  });
  useEffect(() => {
    localStorage.setItem("filterCircuits", JSON.stringify(filterCircuits));
  }, [filterCircuits]);

  const anyFitlered = Object.values(filterCircuits).some(
    (circuit) => circuit == true
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

  console.log("active_sets", active_sets);

  const selectedRouteData = routes[selectedRoute] || null;

  return (
    <div className="sm:mb-8 mb-16">
      <div className="">
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
                    (filterCircuits["projects"] &&
                      projects.some((project) => project === route.id)))
              )
              .map((route) => ({
                id: route.id,
                x: route.x,
                y: route.y,
                isDragging: false,
                complete:
                  climbs.filter(
                    (climb) => climb.route === route.id && climb.sent
                  ).length == 0,
                radius: 4,
                draggable: false,
                color:
                  colorsHex[
                    circuits[sets[route.set_id].circuit_id]?.color || "black"
                  ],
              })) || []
          }
          selected_id={selectedRoute}
          updateDots={(_dots) => {}}
          setSelected={setSelectedRoute}
        />
      </div>

      <div className="mx-4 mt-4 flex flex-wrap gap-1 justify-center h-full">
        {circuitsOrder
          .map((circuit_id) => circuits[circuit_id])
          .map((circuit) =>
            filterCircuits[circuit.id] ? (
              <button
                key={circuit.id}
                className={
                  "cursor-pointer rounded-full px-3 py-1 font-semibold text-sm text-white " +
                  (colors[circuit.color] || "") +
                  " hover:" +
                  (colorsBold[circuit.color] || "")
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
                  "cursor-pointer rounded-full px-3 py-1 text-sm font-semibold text-gray-700  " +
                  (colorsFaint[circuit.color] || "")
                }
                onClick={() =>
                  setFilterCircuits((prev) => ({ ...prev, [circuit.id]: true }))
                }
              >
                {circuit.name}
              </button>
            )
          )}

        <button
          key={"projects"}
          className={
            filterCircuits["projects"]
              ? "cursor-pointer rounded-full px-3 py-1 text-sm font-semibold text-white bg-linear-to-r from-indigo-500 from-10% via-sky-500 via-40% to-emerald-500 to-100%"
              : "cursor-pointer rounded-full px-3 py-1 text-sm font-semibold text-gray-700 bg-linear-to-r from-indigo-200 from-10% via-sky-200 via-40% to-emerald-200 to-100%"
          }
          onClick={() => {
            // if (!filterCircuits["projects"]) {
            //   setFilterCircuits((prev) => {
            //     const updatedFilters = { ...prev };
            //     Object.keys(updatedFilters).forEach((key) => {
            //     updatedFilters[key] = false;
            //     });
            //     return updatedFilters;
            //   });
            // }
            setFilterCircuits((prev) => ({
              ...prev,
              ["projects"]: !filterCircuits["projects"],
            }));
          }}
        >
          Projects
        </button>
      </div>

      {selectedRoute && selectedRouteData ? (
        <RouteCard
          route={selectedRouteData}
          circuits={circuits}
          sets={sets}
          climbs={climbs}
        />
      ) : (
        ""
      )}

      <RouteList />
    </div>
  );
}
