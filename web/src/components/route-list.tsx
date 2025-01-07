import { NavLink } from "react-router";
import { Circuit, Route } from "../types/routes";
import { useEffect, useState } from "react";
import { colors } from "../types/colors";

export function RouteList(props: { routes: Route[] }) {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [circuits, setCircuits] = useState<Circuit[]>([]);

  const [routeModalOpen, setRouteModalOpen] = useState<string>("");
  const [circuiteModalOpen, setCircuitsModalOpen] = useState<boolean>(false);
  const [climbs, setClimbs] = useState<any[]>([]);

  useEffect(() => {
    fetch("api/routes/get_all")
      .then((response) => response.json())
      .then((data) => setRoutes(data))
      .catch((error) => console.error("Error fetching routes:", error));
  }, [routeModalOpen]);

  useEffect(() => {
    fetch("api/circuits/get_all")
      .then((response) => response.json())
      .then((data) => setCircuits(data))
      .catch((error) => console.error("Error fetching routes:", error));
  }, [circuiteModalOpen]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("/api/climbs/me/get_all", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setClimbs(data);
        console.log(data);
      })
      .catch((error) => console.error("Error fetching routes:", error));
  }, []);

  const sent_ids = climbs
    .filter((climb) => climb.sent == true)
    .map((climb) => climb.route);

  return (
    <>
      <div className={"m-8"}>
        {circuits.map((circuit) => (
          <div key={circuit.id} className="mt-4">
            <button
              className="bg-gray-200 hover:bg-gray-300 text-black font-bold py-2 px-4 rounded shadow-lg w-full text-left"
              onClick={() => {
                const updatedCircuits = circuits.map((c) =>
                  c.id === circuit.id ? { ...c, open: !c.open } : c
                );
                setCircuits(updatedCircuits);
              }}
            >
              {circuit.name}

              <span
                className={
                  "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium text-white ml-4 " +
                  (colors[circuit.color] || "")
                }
              >
                {
                  routes.filter((route) => route.circuit_id === circuit.id)
                    .length
                }{" "}
                Routes
              </span>

              <span
                className={
                  "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium text-white ml-4 " +
                  (colors[circuit.color] || "")
                }
              >
                {
                  routes.filter(
                    (route) =>
                      route.circuit_id == circuit.id &&
                      sent_ids.includes(route.id)
                  ).length
                }{" "}
                Sent
              </span>
            </button>
            {circuit.open && (
              <div className="ml-4 mt-2">
                {routes
                  .filter((route) => route.circuit_id === circuit.id)
                  .map((route) => (
                    <div
                      key={route.id}
                      className="bg-gray-100 p-2 rounded mt-1 flex gap-2"
                    >
                      {sent_ids.includes(route.id) ? (
                        <span
                          className={
                            "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium text-white ml-4 " +
                            (colors[circuit.color] || "")
                          }
                        >
                          Sent
                        </span>
                      ) : (
                        <div className={"w-14"}>  </div>
                      )}

                      {route.name}

                      {/* <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                        Red
                      </span> */}
                      <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                        {route.location}
                      </span>
                      {route.style.split(",").map((style) => (
                        <span className="inline-flex items-center rounded-md bg-indigo-100 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                          {style}
                        </span>
                      ))}

                      <NavLink
                        to={"/route/" + route.id}
                        className="ml-auto bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-4 rounded self-center"
                      >
                        {"View"}
                      </NavLink>
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
