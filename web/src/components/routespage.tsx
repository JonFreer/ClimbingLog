import { useEffect, useState } from "react";
import { Set } from "../types/routes";
import { RouteList } from "./route-list";
import DraggableDotsCanvas from "./map";
import { colors, colorsBold, colorsFaint, colorsHex } from "../types/colors";
import { RouteCard } from "./route-card";
import RouteSideBar from "./route-sidebar";
import { useRoutes } from "../features/routes/api/get-routes";
import { useCircuits } from "../features/circuits/api/get-circuits";
import { useSets } from "../features/sets/api/get-sets";
import { useClimbs } from "../features/climbs/api/get-climbs";

export function RoutesPage() {
  const routes = useRoutes().data || {};
  const sets = useSets().data ?? {};
  const circuits = useCircuits().data?.data ?? {};
  const circuitsOrder = useCircuits().data?.order ?? [];
  const climbs = useClimbs().data ?? [];

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
    <div className="sm:mb-8 mb-16">
      <RouteSideBar
        route={routes[sidebarRoute] || null}
        closeCallback={() => setSidebarRoute(undefined)}
      ></RouteSideBar>
      <div className="">
        <DraggableDotsCanvas
          dots={
            Object.values(routes)
              .filter(
                (route) =>
                  sets[route.set_id] &&
                  ((active_sets[sets[route.set_id].circuit_id].id ==
                    route.set_id &&
                    filterCircuits[sets[route.set_id].circuit_id]) ||
                    !anyFitlered)
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
                  "rounded-full px-3 py-1 font-semibold text-sm text-white " +
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
                  "rounded-full px-3 py-1 text-sm font-semibold text-gray-700  " +
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
      </div>

      {selectedRoute && selectedRouteData ? (
        <RouteCard
          route={selectedRouteData}
          circuits={circuits}
          sets={sets}
          climbs={climbs}
          setSidebarRoute={setSidebarRoute}
        />
      ) : (
        ""
      )}

      <RouteList setSidebarRoute={setSidebarRoute} />
    </div>
  );
}
