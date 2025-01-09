import { useEffect, useState } from "react";
import { Circuit, Climb, Route } from "../types/routes";
import { RouteList } from "./route-list";
import DraggableDotsCanvas from "./map";
import { colorsHex } from "../types/colors";
import { RouteCard } from "./route-card";

export function RoutesPage(props: {
  routes: Route[];
  climbs: Climb[];
  circuits: Circuit[];
  updateData: () => void;
}) {

const [selectedRoute, setSelectedRoute] = useState<string | null>(null);

  return (
    <div>
      
      <DraggableDotsCanvas
        dots={props.routes.map((route) => ({
          id: route.id,
          x: route.x,
          y: route.y,
          isDragging: false,
          complete: props.climbs.filter((climb) => climb.route === route.id && climb.sent ).length == 0,
          radius: 3,
          draggable: false,
          color: colorsHex[props.circuits.find(circuit => circuit.id === route.circuit_id)?.color || 'black']
        
        }))}
        updateDots={(_dots) => {}}
        setSelected={setSelectedRoute}
      />

        {selectedRoute && props.routes.find(route => route.id === selectedRoute) != undefined?
        <RouteCard route={props.routes.find(route => route.id === selectedRoute)}
        circuits={props.circuits}
        climbs={props.climbs}
        updateData={props.updateData}/>:''
        
        }
        
      

      <h1 className="mx-8 mt-5 font-bold text-2xl">All Routes</h1>
      <RouteList
        routes={props.routes}
        circuits={props.circuits}
        climbs={props.climbs}
        updateData={props.updateData}
      />
    </div>
  );
}
