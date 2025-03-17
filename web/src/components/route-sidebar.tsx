"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  TransitionChild,
} from "@headlessui/react";
import {HeartIcon as HeartIconFill} from "@heroicons/react/24/solid";
import { XMarkIcon, HeartIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Circuit, Climb, Projects, Route, SentBy, Set } from "../types/routes";
import { colors, colorsBold, colorsPastel } from "../types/colors";

export default function RouteSideBar(props: {
  route: Route | undefined;
  climbs: Climb[];
  circuits: Record<string, Circuit>;
  sets: Record<string, Set>;
  projects: Projects;
  updateData: () => void;
  closeCallback: () => void;
}) {

  const [sentBy, setSentBy] = useState<SentBy>({users:[],num_users:0});

  function updateSentBy(){
    if (props.route) {
      fetch("api/routes/sent_by/"+props.route.id)
      .then((response) => response.json())
      .then((data) => setSentBy(data))
      .catch((error) => console.error("Error fetching sent_by:", error));
    }
  }

  const [route, setRoute] = useState<Route>({
    id: "",
    name: "",
    location: "",
    style: "",
    set_id: "",
    x: 0,
    y: 0,
    grade: "",
  });

  const [justCompleted, setJustCompleted] = useState(false);

  useEffect(() => {
    setJustCompleted(false);
  },[props.route?.id]);

  useEffect(() => {
    if (props.route != undefined) {
      setRoute(props.route);
      updateSentBy();
    }
  }, [props.route]);

  const complete = props.climbs.find(
    (climb) => climb.route == route.id && climb.sent == true
  );
  const attempts = props.climbs.filter(
    (climb) => climb.route == route.id && climb.sent == false
  );
  const sends = props.climbs.filter(
    (climb) => climb.route == route.id && climb.sent == true
  );

  const circuit = props.circuits[props.sets[route.set_id]?.circuit_id]; 

  const open = props.route != undefined;
  return (
    <Dialog
      open={open}
      onClose={() => props.closeCallback()}
      className="relative z-10"
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity duration-500 ease-in-out data-[closed]:opacity-0"
      />

      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <DialogPanel
              transition
              className="pointer-events-auto relative w-screen max-w-md transform transition duration-500 ease-in-out data-[closed]:translate-x-full sm:duration-700"
            >
              <TransitionChild>
                <div className="absolute left-0 top-0 -ml-8 flex pr-2 pt-4 duration-500 ease-in-out data-[closed]:opacity-0 sm:-ml-10 sm:pr-4">
                  <button
                    type="button"
                    onClick={() => props.closeCallback()}
                    className="relative rounded-md text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                  >
                    <span className="absolute -inset-2.5" />
                    <span className="sr-only">Close panel</span>
                    <XMarkIcon aria-hidden="true" className="size-6" />
                  </button>
                </div>
              </TransitionChild>

              <div className="flex h-full flex-col overflow-y-scroll bg-white  shadow-xl">
               
                <div className="relative flex-1 ">
                <div className={"relative p-4 flex justify-center items-center " + (circuit ? colorsPastel[circuit.color] || "" : "")}>
                    <div className="relative inline-block m-auto rounded-xl bg-white">
                        {complete? <div className="absolute bg-green-600 text-white right-[-13px] top-[-13px] z-50 rounded-lg px-3 py-2 font-bold text-xl drop-shadow-lg m-2">
                        Sent
                        </div> : ""}
                          
                        <img
                        className={"max-h-96 rounded-xl " + (justCompleted ? "shimmer" : "")}
                        src={"/api/img/" + route.id + ".webp"}
                        ></img>
                    </div>
                    </div>
                  <div className="p-8 pb-2 flex">
                    <DialogTitle className="p-2 text-base font-semibold text-gray-900">
                      {route.name}
                    </DialogTitle>

                    {!props.projects.includes(route.id) ? 
                    <button onClick={()=>{add_project(route.id,props.updateData)}} className="ml-auto  hover:bg-gray-100 hover:text-gray-500 text-gray-400 p-2 rounded-full flex items-center">
                      <HeartIcon aria-hidden="true" className="size-6" />
                    </button>:
                      <button onClick={()=>{remove_project(route.id,props.updateData)}} className="ml-auto  hover:bg-red-100 hover:text-red-500 text-red-500 p-2 rounded-full flex items-center">
                      <HeartIconFill aria-hidden="true" className="size-6" />
                    </button>}
                  </div>

                  <div className="px-8 grid grid-cols-2 gap-4">
                    <div className="text-center py-2 ">
                      <span className="block text-sm font-medium text-gray-700">
                        Attempts
                      </span>
                      <span className="block text-xl font-semibold text-gray-900">
                        {attempts.length}
                      </span>
                    </div>
                    <div className="text-center py-2">
                      <span className="block text-sm font-medium text-gray-700">
                        Sends
                      </span>
                      <span className="block text-xl font-semibold text-gray-900">
                        {sends.length}
                      </span>
                    </div>
                  </div>
                  <div className="px-8 pt-2 grid grid-cols-2 gap-4 ">
                    <button
                      onClick={() => {
                        add_attempt(route.id, props.updateData);
                      }}
                      className=" text-center rounded-md hover:bg-gray-100 hover:text-gray-900 px-3 py-2 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-500/30"
                    >
                      Add Attempt
                    </button>
                    <button
                      onClick={() => {
                        add_send(route.id, props.updateData);
                        setJustCompleted(true);
                      }}
                      className={"rounded-md  px-3 py-2 text-sm font-semibold text-white shadow-sm  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2  " +  (circuit ? colors[circuit.color] || "" : "") +" "+  (circuit ? "hover:"+colorsBold[circuit.color] || "" : "") }
                    >
                      Add Send
                    </button>
                  </div>


                  {sentBy.num_users!=0 ?  <>
                    <div className="px-10 pt-5 text-m mx-1 text-gray-400 flex">
                    Sent by
                    {sentBy.users.length > 0 ?  <a key={sentBy.users[0].id} className="font-bold ml-1">{sentBy.users[0].username}</a>:null}
                    {sentBy.users.length > 1 ?  <a key={sentBy.users[1].id} className="font-bold">, {sentBy.users[1].username}</a>:null}
                    {sentBy.users.length > 1 && sentBy.num_users > 2 && (
                      <span className="ml-1">
                       and <span className="font-bold">{sentBy.num_users - 2} {sentBy.num_users - 2==1? "other":"others"}</span>
                      </span>
                    )}
                    </div>
                  </>:<></>}

                  <DialogTitle className="px-10 pt-5 text-base font-semibold text-gray-600">
                    History
                  </DialogTitle>
                  {attempts.length + sends.length > 0 && (
                    <div className="m-4  mt-0 lg:ml-4 lg:mt-0 rounded-md p-4 max-h-42 divide-y divide-gray-200">
                      {props.climbs
                        .filter((climb) => climb.route == route.id)
                        .reverse()
                        .map((climb) => (
                          <div
                            key={climb.id}
                            className="flex items-center justify-between p-2 bg-white "
                          >
                            <div className="text-sm text-gray-600">
                              {new Date(climb.time).toLocaleString("en-GB", {
                                hour: "2-digit",
                                minute: "2-digit",
                                day: "2-digit",
                                month: "2-digit",
                                year: "2-digit",
                              })}
                            </div>
                            <div
                              className={`text-sm font-semibold ${
                                climb.sent ? "text-green-600" : "text-gray-600"
                              }`}
                            >
                              {climb.sent ? "Send" : "Attempt"}
                            </div>
                            <button
                              className="text-gray-300 p-2 hover:text-gray-700 hover:bg-gray-200 rounded-md"
                              onClick={() =>
                                remove_climb(climb.id, props.updateData)
                              }
                            >
                              <TrashIcon
                                aria-hidden="true"
                                className="h-5 w-5"
                              />
                            </button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

function add_project(id: string | undefined, sucessCallback: () => void) {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  if (id) {
    formData.append("route_id", id);
  } else {
    console.error("Route ID is undefined");
    return;
  }

  fetch("/api/projects/me/add", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Project added:", data);
      sucessCallback();
    })
    .catch((error) => console.error("Error adding project:", error));
}

function remove_project(id: string | undefined, sucessCallback: () => void) {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  if (id) {
    formData.append("route_id", id);
  } else {
    console.error("Route ID is undefined");
    return;
  }

  fetch("/api/projects/me/remove", {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Project removed:", data);
      sucessCallback();
    })
    .catch((error) => console.error("Error removing project:", error));
}


function add_send(id: string | undefined, sucessCallback: () => void) {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  if (id) {
    formData.append("route", id);
  } else {
    console.error("Route ID is undefined");
    return;
  }

  fetch("/api/climbs/me/add_send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Attempt added:", data);
      sucessCallback();
    })
    .catch((error) => console.error("Error adding attempt:", error));
}

function add_attempt(id: string | undefined, sucessCallback: () => void) {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  if (id) {
    formData.append("route", id);
  } else {
    console.error("Route ID is undefined");
    return;
  }

  fetch("/api/climbs/me/add_attempt", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Attempt added:", data);
      sucessCallback();
    })
    .catch((error) => console.error("Error adding attempt:", error));
}

function remove_climb(id: string | undefined, sucessCallback: () => void) {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  if (id) {
    formData.append("climb_id", id);
  } else {
    console.error("Route ID is undefined");
    return;
  }

  fetch("/api/climbs/me/remove_climb", {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Attempt added:", data);
      sucessCallback();
    })
    .catch((error) => console.error("Error adding attempt:", error));
}
