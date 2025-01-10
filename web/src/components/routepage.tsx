import { useParams } from "react-router";
import { Circuit, Route } from "../types/routes";
import { CheckCircleIcon } from '@heroicons/react/16/solid'
// export function RoutePage(){

//     const { id } = useParams();

//     return <div>Hi {id}</div>
// }

import {
  BriefcaseIcon,
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  CurrencyDollarIcon,
  LinkIcon,
  MapPinIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/20/solid";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useEffect, useState } from "react";
import { colors } from "../types/colors";

export function RoutePage(props: {
  routes: Route[];
  climbs: any[];
  circuits: Circuit[];
  updateData: () => void;
}) {
  const { id } = useParams();

  const route = props.routes.find((route) => route.id == id);
  const complete = props.climbs.find(
    (climb) => climb.route == id && climb.sent == true
  );
  const attempts = props.climbs.filter(
    (climb) => climb.route == id && climb.sent == false
  );
  const sends = props.climbs.filter(
    (climb) => climb.route == id && climb.sent == true
  );





  const circuit = props.circuits.find((circuit) => circuit.id == route?.circuit_id);
  console.log("complete", complete, props.climbs);
  return (
    <div>
      <div className="bg-gray-300">
        <img
          className={"m-auto max-h-96"}
          src={"/api/img/" + id + ".webp"}
        ></img>
      </div>
      <div className="lg:flex lg:items-center lg:justify-between m-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            {route?.name}{" "}
            {complete ? (
              <span className="float-right">
                <div className=" inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                  <CheckIcon
                    aria-hidden="true"
                    className="-ml-0.5 mr-1.5 size-5"
                  />
                  Sent
                </div>
              </span>
            ) : (
              ""
            )}
          </h2>
          <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
            <div className="mt-2">
              <span className="inline-flex items-center rounded-md bg-gray-50 px-3 py-2 text-sm font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                Attempts: {attempts.length}
              </span>
              <span className="inline-flex items-center rounded-md mx-1 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                Sends: {sends.length}
              </span>
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              Location
              <span className="ml-2 inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                {route?.location}
              </span>
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              Circuit 
              <span className={
                                "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium text-white ml-4 " +
                                (circuit ? colors[circuit.color] || "" : "")
                              }>
                {circuit?.name}
                </span>
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              Style
              {route?.style.split(",").map((style) => (
                <span className="ml-2 inline-flex items-center rounded-md bg-indigo-100 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                  {style}
                </span>
              ))}
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <CalendarIcon
                aria-hidden="true"
                className="mr-1.5 size-5 shrink-0 text-gray-400"
              />
              Added on January 9, 2020
            </div>
          </div>
        </div>
      
      </div>
      <div className="m-8 flex lg:ml-4 lg:mt-0">
          <span className="sm:block">
            <button
              onClick={() => {
                add_attempt(id, props.updateData);
              }}
              type="button"
              className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              {/* <PencilIcon aria-hidden="true" className="-ml-0.5 mr-1.5 size-5 text-gray-400" /> */}
              Add attempt
            </button>
          </span>

          <span className="ml-3 sm:block">
            <button
              type="button"
              className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              onClick={() => {
                add_send(id, props.updateData);
              }}
            >
              {/* <LinkIcon aria-hidden="true" className="-ml-0.5 mr-1.5 size-5 text-gray-400" /> */}
              Add Send
            </button>
          </span>
        </div>
      {attempts.length + sends.length > 0 ? 
      <div className="m-8 gap-4 lg:ml-4 lg:mt-0 rounded-md bg-gray-100 p-4 max-h-36 overflow-y-scroll">
        {props.climbs
          .filter((climb) => climb.route == id).reverse()
          .map((climb) => (
            <div
              key={climb.id}
              className="flex mb-2 items-center justify-between p-2 bg-white rounded-md shadow-sm"
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
              <button className="text-gray-300 p-2 hover:text-gray-700 hover:bg-gray-200 rounded-md" onClick={()=>remove_climb(climb.id,props.updateData)}>
                <TrashIcon aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>
          ))}
      </div>:''}
    </div>
  );
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


