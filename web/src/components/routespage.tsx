import { useEffect, useState } from "react";
import { Circuit, Climb, Projects, Route, Set } from "../types/routes";
import { RouteList } from "./route-list";
import DraggableDotsCanvas from "./map";
import { colors, colorsBold, colorsBorder, colorsHex } from "../types/colors";
import { RouteCard } from "./route-card";
import RouteSideBar from "./route-sidebar";
import { XMarkIcon } from "@heroicons/react/24/solid";

export function RoutesPage(props: {
  routes: Route[];
  climbs: Climb[];
  circuits: Record<string, Circuit>;
  sets: Record<string, Set>;
  projects: Projects
  updateData: () => void;
}) {

const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
const [sidebarRoute, setSidebarRoute] = useState<string | undefined>(undefined);
const [filterCircuits, setFilterCircuits] = useState<{ [key: string]: boolean }>(
  () => {
    const filterCircuits = localStorage.getItem("filterCircuits");
    return filterCircuits ? JSON.parse(filterCircuits) : {};
  }
);
useEffect(() => {
  localStorage.setItem("filterCircuits", JSON.stringify(filterCircuits));
}, [filterCircuits]);

  const anyFitlered  = Object.values(filterCircuits).some((circuit) => circuit == true);

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

  return (
    <div>
      <RouteSideBar 
        route={props.routes.find(route => route.id === sidebarRoute)}
        circuits={props.circuits}
        sets={props.sets}
        climbs={props.climbs}
        projects={props.projects}
        updateData={props.updateData}
        closeCallback={()=>setSidebarRoute(undefined)}></RouteSideBar>
      <DraggableDotsCanvas
        dots={props.routes.filter((route) => props.sets[route.set_id] && (filterCircuits[props.sets[route.set_id].circuit_id] || !anyFitlered)).map((route) => ({
          id: route.id,
          x: route.x,
          y: route.y,
          isDragging: false,
          complete: props.climbs.filter((climb) => climb.route === route.id && climb.sent ).length == 0,
          radius: 4,
          draggable: false,
          color: colorsHex[props.circuits[props.sets[route.set_id].circuit_id]?.color || 'black']
        
        }))}
        selected_id={selectedRoute}
        updateDots={(_dots) => {}}
        setSelected={setSelectedRoute}
      />

      <div className="mx-4 mt-4 flex flex-wrap gap-2 justify-center">
        <div className="text-md font-medium text-gray-600">
        Filters:
        </div>
        {Object.values(props.circuits).filter((circuit)=>filterCircuits[circuit.id]).map((circuit) => <button className={"rounded-full px-3 py-1 text-sm font-medium text-white " + (colors[circuit.color] || "") + " hover:"+ (colorsBold[circuit.color] || "")}
         onClick={() => setFilterCircuits((prev) => ({...prev, [circuit.id]: false}))}>
          <XMarkIcon className="h-3 w-3 inline-block mr-1"/>
          {circuit.name}
        </button>)}

        {Object.values(props.circuits).filter((circuit)=>!filterCircuits[circuit.id]).map((circuit) => <button className={"rounded-full px-3 py-[2px] text-sm font-medium text-gray-600 border-2 "+ (colorsBorder[circuit.color] || "") }
        onClick={() => setFilterCircuits((prev) => ({...prev, [circuit.id]: true}))}>
          + {circuit.name}
        </button>)}

      </div>

        {selectedRoute && props.routes.find(route => route.id === selectedRoute) != undefined?
        <RouteCard route={props.routes.find(route => route.id === selectedRoute)}
        circuits={props.circuits}
        sets={props.sets}
        climbs={props.climbs}
        updateData={props.updateData}
        setSidebarRoute={setSidebarRoute}/>:''
        
}
        
   
      <RouteList
        routes={props.routes}
        sets={props.sets}
        circuits={props.circuits}
        climbs={props.climbs}
        projects={props.projects}
        updateData={props.updateData}
        setSidebarRoute={setSidebarRoute}
      />
    </div>
  );
}
