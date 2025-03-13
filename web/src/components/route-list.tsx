import { NavLink } from "react-router";
import { Circuit, Projects, Route } from "../types/routes";
import { useEffect, useState } from "react";
import { colors } from "../types/colors";
import { ChevronRightIcon } from "@heroicons/react/24/solid";

export function RouteList(props: {
  routes: Route[];
  climbs: any[];
  circuits: Circuit[];
  projects: Projects;
  updateData: () => void;
  setSidebarRoute: (route: string) => void;
}) {
  // const [openCircuits, setCircuits] = useState<{ [key: string]: boolean }>({});
  const [openCircuits, setCircuits] = useState<{ [key: string]: boolean }>(
    () => {
      const savedOpenCircuits = localStorage.getItem("openCircuits");
      return savedOpenCircuits ? JSON.parse(savedOpenCircuits) : {};
    }
  );

  var sent_ids: string[] = [];
  if (props.climbs != undefined) {
    sent_ids = props.climbs
      .filter((climb) => climb.sent == true)
      .map((climb) => climb.route);
  }

  if (props.circuits == undefined) {
    return <div> Loading </div>;
  }

  useEffect(() => {
    localStorage.setItem("openCircuits", JSON.stringify(openCircuits));
  }, [openCircuits]);

  return (
    <>
      {props.projects.length > 0 ? 
      <>
        <div key={"projects"} className="mt-12 mx-4">
            <button
              className="bg-white hover:bg-gray-50 text-gray-900 font-medium  rounded-lg shadow w-full text-left flex justify-between items-center"
              onClick={() => {
                setCircuits((prev) => ({
                  ...prev,
                  "projects": !prev["projects"],
                }));
              }}
            >
              <div className="flex items-center w-full">
                <span className="text-lg font-bold text-white uppercase px-2 py-2 pr-10 min-w-52 text-center rounded-l-lg bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-40% to-emerald-500 to-100% clip-path">Your Projects</span>
                <span
                  className={
                    "font-bold ml-auto mr-2"
                  }
                >
                  {
                    props.routes.filter(
                      (route) =>
                        props.projects.includes(route.id) &&
                        sent_ids.includes(route.id)
                    ).length
                  }{" "}
                  /{" "}
                  {
                    props.routes.filter(
                      (route) => props.projects.includes(route.id)
                    ).length
                  }{" "}
                  Routes
                </span>
              </div>
              <ChevronRightIcon
                className={`h-5 w-5 mr-3 transform transition-transform ${
                  openCircuits["projects"] ? "rotate-90" : ""
                }`}
              />
            </button>
            {openCircuits["projects"] && (
              <div className="ml mt-2" key={"projects"}> 
                {props.routes
                  .filter((route) => props.projects.includes(route.id))
                  .map((route) => (
                    <div
                      key={route.id}
                      onClick={()=>props.setSidebarRoute(route.id)}
                      className="bg-white shadow overflow-hidden sm:rounded-lg mt-2 cursor-pointer hover:bg-slate-50"
                    >
                      <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                        <div className="flex items-center">
                          <img
                            className="h-24 rounded"
                            src={"/api/img_thumb/" + route.id + ".webp"}
                            alt=""
                          ></img>
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
                        <div>
                          {sent_ids.includes(route.id) ? (
                            <span
                              className={
                                "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white " +
                                (colors[props.circuits.find(circuit => circuit.id === route.circuit_id)?.color || ""] || "")
                              }
                            >
                              Sent
                            </span>
                          ) : (
                            <div className={"w-14"}> </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
      </>
      : null
      }


      <div className={"mx-4 mb-8"}>
        {props.circuits.map((circuit) => (
          <div key={circuit.id} className="mt-4">
            <button
              className="bg-white hover:bg-gray-50 text-gray-900 font-medium  rounded-lg shadow w-full text-left flex justify-between items-center"
              onClick={() => {
                setCircuits((prev) => ({
                  ...prev,
                  [circuit.id]: !prev[circuit.id],
                }));
              }}
            >
              <div className="flex items-center w-full">
                <span className={"text-lg font-bold text-white uppercase px-2 py-2 pr-10 w-52 text-center rounded-l-lg clip-path truncate "+
                    (colors[circuit.color] || "")}>{circuit.name}</span>
                <div
                  className={
                    "font-bold ml-auto mr-2"
                  }
                >
                  {
                    props.routes.filter(
                      (route) =>
                        route.circuit_id == circuit.id &&
                        sent_ids.includes(route.id)
                    ).length
                  }{" "}
                  /{" "}
                  {
                    props.routes.filter(
                      (route) => route.circuit_id === circuit.id
                    ).length
                  }{" "}
                  Routes
                </div>
              </div>
              <ChevronRightIcon
                className={`h-5 w-5 mr-3 transform transition-transform ${
                  openCircuits[circuit.id] ? "rotate-90" : ""
                }`}
              />
            </button>
            {openCircuits[circuit.id] && (
              <div className="ml mt-2" key={circuit.id}> 
                {props.routes
                  .filter((route) => route.circuit_id === circuit.id)
                  .map((route) => (
                    <div
                      key={route.id}
                      onClick={()=>props.setSidebarRoute(route.id)}
                      className="bg-white shadow overflow-hidden sm:rounded-lg mt-2 cursor-pointer hover:bg-slate-50"
                    >
                      <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                        <div className="flex items-center">
                          <img
                            className="h-24 rounded"
                            src={"/api/img_thumb/" + route.id + ".webp"}
                            alt=""
                          ></img>
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
                        <div>
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
                        </div>
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

}
