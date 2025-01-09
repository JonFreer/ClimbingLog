import { NavLink } from "react-router";
import { colors } from "../types/colors";
import { Circuit, Route } from "../types/routes";
import { ChevronRightIcon } from "@heroicons/react/20/solid";

export function RouteCard(props:{route:Route,climbs:any[],circuits:Circuit[], updateData : () => void}) {

    var sent_ids:string[] = [];
    if(props.climbs != undefined){
      sent_ids = props.climbs
      .filter((climb) => climb.sent == true)
      .map((climb) => climb.route);
    }

    const circuit = props.circuits.find((circuit) => circuit.id == props.route.circuit_id);
  
  return (
    <div
                    key={props.route.id}
                    className="bg-white shadow overflow-hidden sm:rounded-lg mt-2"
                  >
                    <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
                    <div className="flex items-center">
                      {sent_ids.includes(props.route.id) ? (
                      <span
                        className={
                        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white " +
                        (circuit ? colors[circuit.color] || "" : "")
                        }
                      >
                        Sent
                      </span>
                      ) : (
                      <div className={"w-14"}> </div>
                      )}
                      <div className="ml-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {props.route.name}
                      </h3>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        {props.route.location}
                      </p>
                      <div className="flex gap-2 mt-1">
                        {props.route.style.split(",").map((style) => (
                        <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-gray-600">
                          {style}
                        </span>
                        ))}
                      </div>
                      </div>
                    </div>
                    <NavLink
                      to={"/route/" + props.route.id}
                      className={"ml-aut text-white text-xs p-2 px-4 rounded-full flex items-center " + (circuit ? colors[circuit.color] || "" : "bg-turquoise-500 hover:bg-turquoise-600")}
                    >
                      <ChevronRightIcon className="h-5 w-5" />
                    </NavLink>
                    </div>
                  </div>
  );
}