import { NavLink } from "react-router";
import { Circuit, Route } from "../types/routes";
import { useEffect, useState } from "react";
import { colors } from "../types/colors";
import { ChevronRightIcon } from "@heroicons/react/24/solid";

export function RouteList(props:{routes:Route[],climbs:any[],circuits:Circuit[], updateData : () => void}) {

  const [routeModalOpen, setRouteModalOpen] = useState<string>("");
  const [circuiteModalOpen, setCircuitsModalOpen] = useState<boolean>(false);
// const [openCircuits, setCircuits] = useState<{ [key: string]: boolean }>({});
    const [openCircuits, setCircuits] = useState<{ [key: string]: boolean }>(() => {
        const savedOpenCircuits = localStorage.getItem("openCircuits");
        return savedOpenCircuits ? JSON.parse(savedOpenCircuits) : {};
    });

  var sent_ids:string[] = [];
  if(props.climbs != undefined){
    sent_ids = props.climbs
    .filter((climb) => climb.sent == true)
    .map((climb) => climb.route);
  }

  if (props.circuits == undefined){
    return <div> Loading </div>
  }

    useEffect(() => {
        localStorage.setItem("openCircuits", JSON.stringify(openCircuits));
    }, [openCircuits]);

  return (
    <>
      <div className={"m-8"}>
        {props.circuits.map((circuit) => (
          <div key={circuit.id} className="mt-4">
            <button
              className="bg-white hover:bg-gray-50 text-gray-900 font-medium py-2 px-4 rounded-lg shadow-sm w-full text-left flex justify-between items-center border border-gray-300"
              onClick={() => {
              setCircuits((prev) => ({
                ...prev,
                [circuit.id]: !prev[circuit.id],
              }));
              }}
            >
              <div className="flex items-center">
              <span className="text-lg font-medium">{circuit.name}</span>
              <span
                className={
                "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium text-white ml-4 " +
                (colors[circuit.color] || "")
                }
              >
                  {
                props.routes.filter(
                  (route) =>
                  route.circuit_id == circuit.id &&
                  sent_ids.includes(route.id)
                ).length
                } / {
                props.routes.filter((route) => route.circuit_id === circuit.id)
                  .length
                }{" "}
                Routes
              </span>
           
              </div>
              <ChevronRightIcon
              className={`h-5 w-5 transform transition-transform ${
                openCircuits[circuit.id] ? "rotate-90" : ""
              }`}
              />
            </button>
            {openCircuits[circuit.id] && (
                <div className="ml mt-2">
                {props.routes
                  .filter((route) => route.circuit_id === circuit.id)
                  .map((route) => (
                  <div
                    key={route.id}
                    className="bg-white shadow overflow-hidden sm:rounded-lg mt-2"
                  >
                    <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
                    <div className="flex items-center">
                      {sent_ids.includes(route.id) ? (
                      <span
                        className={
                        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white " +
                        (colors[circuit.color] || "")
                        }
                      >
                        Sent
                      </span>
                      ) : (
                      <div className={"w-14"}> </div>
                      )}
                      <div className="ml-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {route.name}
                      </h3>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        {route.location}
                      </p>
                      <div className="flex gap-2 mt-1">
                        {route.style.split(",").map((style) => (
                        <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-gray-600">
                          {style}
                        </span>
                        ))}
                      </div>
                      </div>
                    </div>
                    <NavLink
                      to={"/route/" + route.id}
                      className="ml-auto bg-blue-500 hover:bg-blue-600 text-white text-xs p-2 px-4 rounded-full flex items-center"
                    >
                      <ChevronRightIcon className="h-5 w-5" />
                    </NavLink>
                    </div>
                  </div>
                  ))}
                </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
  //   return (
  //     <ul role="list" className="divide-y divide-gray-100 m-5">
  //       {props.routes.map((route) => (
  //         <li key={route.id} className="flex justify-between gap-x-6 py-5">
  //           <div className="flex min-w-0 gap-x-4">
  //             <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
  //               Red
  //             </span>
  //             <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
  //               {route.location}
  //             </span>
  //              {route.style.split(',').map((style) =>
  //                   <span className="inline-flex items-center rounded-md bg-indigo-100 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
  //                     {style}
  //                 </span>
  //              )}

  //           </div>
  //              <div> <NavLink to={"/route/"+route.id} className=" bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded self-center">
  //                 {"View"}
  //             </NavLink>
  //             <a className=" ml-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded self-center">
  //                 Sent
  //             </a></div>

  //         </li>
  //       ))}
  //     </ul>
  //   );
}
