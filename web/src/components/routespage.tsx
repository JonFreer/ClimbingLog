import { useEffect, useState } from "react";
import { Circuit, Climb, Projects, Route, Set } from "../types/routes";
import { RouteList } from "./route-list";
import DraggableDotsCanvas from "./map";
import {
  colors,
  colorsBold,
  colorsBorder,
  colorsFaint,
  colorsHex,
} from "../types/colors";
import { RouteCard } from "./route-card";
import RouteSideBar from "./route-sidebar";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useRoutes } from "../features/routes/api/get-routes";
import { useCircuits } from "../features/circuits/api/get-circuits";
import { useSets } from "../features/sets/api/get-sets";
import { useClimbs } from "../features/climbs/api/get-climbs";

export function RoutesPage(props: {
  projects: Projects;
  updateData: () => void;
}) {
  const routesQuery = useRoutes();
  const { data: circuits } = useCircuits();
  const { data: sets } = useSets();
  const { data: climbs } = useClimbs();

  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [sidebarRoute, setSidebarRoute] = useState<string | undefined>(
    undefined
  );
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

  // Hijack the back button to close the sidebar
  useEffect(() => {
    const handlePopState = () => {
      setSidebarRoute(undefined);
      // window.onpopstate = undefined;
    };

    if (sidebarRoute) {
      window.addEventListener("popstate", handlePopState);
      window.history.pushState(null, "", window.location.href);
    }

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [sidebarRoute]);

  const active_sets = Object.values(sets.data).reduce((acc, set) => {
    if (
      !acc[set.circuit_id] ||
      new Date(set.date) > new Date(acc[set.circuit_id].date)
    ) {
      acc[set.circuit_id] = set;
    }
    return acc;
  }, {} as Record<string, Set>);

  const selectedRouteData = routesQuery.data?.data.find(
    (route) => route.id === selectedRoute
  );

  return (
    <div className="sm:mb-8 mb-16">
      <RouteSideBar
        route={routesQuery.data?.data.find(
          (route) => route.id === sidebarRoute
        )}
        updateData={props.updateData}
        closeCallback={() => setSidebarRoute(undefined)}
      ></RouteSideBar>
      <div className="">
        <DraggableDotsCanvas
          dots={
            routesQuery.data?.data
              .filter(
                (route) =>
                  sets.data[route.set_id] &&
                  ((active_sets[sets.data[route.set_id].circuit_id].id ==
                    route.set_id &&
                    filterCircuits[sets.data[route.set_id].circuit_id]) ||
                    !anyFitlered)
              )
              .map((route) => ({
                id: route.id,
                x: route.x,
                y: route.y,
                isDragging: false,
                complete:
                  climbs.data.filter(
                    (climb) => climb.route === route.id && climb.sent
                  ).length == 0,
                radius: 4,
                draggable: false,
                color:
                  colorsHex[
                    circuits.data[sets.data[route.set_id].circuit_id]?.color ||
                      "black"
                  ],
              })) || []
          }
          selected_id={selectedRoute}
          updateDots={(_dots) => {}}
          setSelected={setSelectedRoute}
        />
      </div>
      <div className="mx-4 mt-4 flex flex-wrap gap-1 justify-center h-full">
        {Object.values(circuits.data)
          .filter((circuit) => filterCircuits[circuit.id])
          .map((circuit) => (
            <button
              className={
                "rounded-full px-3 py-1 font-semibold text-sm  text-white " +
                (colors[circuit.color] || "") +
                " hover:" +
                (colorsBold[circuit.color] || "")
              }
              onClick={() =>
                setFilterCircuits((prev) => ({ ...prev, [circuit.id]: false }))
              }
            >
              {circuit.name}
            </button>
          ))}

        {Object.values(circuits.data)
          .filter((circuit) => !filterCircuits[circuit.id])
          .map((circuit) => (
            <button
              className={
                "rounded-full px-3 py-1 text-sm font-semibold text-gray-700  " +
                (colorsFaint[circuit.color] || "")
              }
              onClick={() =>
                setFilterCircuits((prev) => ({ ...prev, [circuit.id]: true }))
              }
            >
              {circuit.name}
            </button>
          ))}
      </div>

      {selectedRoute && selectedRouteData ? (
        <RouteCard
          route={selectedRouteData}
          circuits={circuits.data}
          sets={sets.data}
          climbs={climbs.data}
          updateData={props.updateData}
          setSidebarRoute={setSidebarRoute}
        />
      ) : (
        ""
      )}

      <RouteList
        updateData={props.updateData}
        setSidebarRoute={setSidebarRoute}
      />
    </div>
  );
}
