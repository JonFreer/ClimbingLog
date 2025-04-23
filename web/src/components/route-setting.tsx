"use client";

import { useEffect, useRef, useState } from "react";
import { Circuit, Route, Set } from "../types/routes";

import { colors, colorsFaint } from "../types/colors";

import { AddSet } from "./modals/add_set";
import { useRoutes } from "../features/routes/api/get-routes";
import { DeleteRoute } from "../features/routes/components/delete-route";
import { CreateRoute } from "../features/routes/components/create-route";
import { useCircuits } from "../features/circuits/api/get-circuits";
import { UpdateRoute } from "../features/routes/components/update-route";
import { useSets } from "../features/sets/api/get-sets";

export function RouteSettingPage() {
  const routesQuery = useRoutes();
  const { data: circuits } = useCircuits();
  const { data: sets } = useSets();
  // const [circuits, setCircuits] = useState<Record<string, Circuit>>({});

  const [routeModalOpen, setRouteModalOpen] = useState<{
    set_id: string;
    route: null | Route;
  }>({ set_id: "", route: null });
  const [deleteRouteModalOpen, setDeleteRouteModalOpen] = useState<string>("");
  const [setModalOpen, setSetModalOpen] = useState<boolean>(false);
  const [openCircuit, setOpenCircuit] = useState<string>("");
  const [selectedSet, setSelectedSet] = useState<string>("");

  useEffect(() => {
    const savedCircuit = localStorage.getItem("openCircuit");
    if (savedCircuit) {
      setOpenCircuit(savedCircuit);
    }
  }, []);

  useEffect(() => {
    if (openCircuit) {
      localStorage.setItem("openCircuit", openCircuit);
    }
  }, [openCircuit]);

  useEffect(() => {
    if (openCircuit) {
      const recentSet = Object.values(sets?.data || {})
        .filter((set) => set.circuit_id === openCircuit)
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0];
      if (recentSet) {
        setSelectedSet(recentSet.id);
      } else {
        setSelectedSet("");
      }
    }
  }, [openCircuit, sets]);

  // useEffect(() => {
  //   routesQuery.refetch();
  // }, [routeModalOpen]);

  return (
    <div className="m-5 sm:mb-8 mb-14">
      <AddSet
        open={setModalOpen}
        setOpen={setSetModalOpen}
        circuit_id={openCircuit}
      />
      <div className="flex gap-4 mt-5">
        <h1 className="font-bold text-3xl">Route Setting</h1>
      </div>

      <div className=" flex justify-center gap-2 flex-wrap text-white my-4">
        {Object.values(circuits?.data || {}).map((circuit, index, array) => (
          <button
            key={circuit.id}
            className={
              "p-2 font-bold rounded-sm uppercase " +
              (openCircuit == circuit.id
                ? `${colors[circuit.color]} shadow-sm` || ""
                : `${colorsFaint[circuit.color]} `)
            }
            onClick={() => setOpenCircuit(circuit.id)}
          >
            {circuit.name}
          </button>
        ))}
      </div>

      {openCircuit && (
        <div className="flex m-2">
          <span className={`font-bold text-lg rounded-lg text-gray-900`}>
            {" "}
            {openCircuit && circuits?.data[openCircuit]?.name}{" "}
          </span>
          <span className="ml-auto flex">
            <span className="flex items-center mr-2 ">Set: </span>
            <select
              className="block w-full rounded-md bg-white px-3 py-2.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
              value={selectedSet}
              onChange={(e) => setSelectedSet(e.target.value)}
            >
              {Object.values(sets?.data || {})
                .filter((set) => set.circuit_id === openCircuit)
                .map((set) => (
                  <option key={set.id} value={set.id}>
                    {new Date(set.date).toLocaleString("default", {
                      month: "long",
                      year: "numeric",
                    })}
                  </option>
                ))}
            </select>
          </span>
          <span
            className={
              "ml-2 px-2 text-sm py-2 rounded-lg font-bold text-white cursor-pointer " +
              (circuits?.data[openCircuit]
                ? colors[circuits?.data[openCircuit].color]
                : "")
            }
            onClick={() => setSetModalOpen(true)}
          >
            + Set
          </span>
        </div>
      )}

      {selectedSet != "" && (
        <div className="m-2 flex items-center justify-between">
          <span>
            {new Date(sets?.data[selectedSet]?.date || "").toLocaleString(
              "default",
              {
                month: "long",
                year: "numeric",
              }
            )}
          </span>
          <CreateRoute set_id={selectedSet} circuit_id={openCircuit} />
        </div>
      )}

      {selectedSet != "" &&
        (routesQuery.data?.data || [])
          .filter((route) => route.set_id === selectedSet)
          .map((route) => (
            <div
              key={route.id}
              className="bg-gray-100 p-1 flex rounded-sm mt-1"
            >
              <span className="p-2">{route.name}</span>

              <UpdateRoute
                set_id={selectedSet}
                circuit_id={openCircuit}
                route={route}
              />
              <DeleteRoute id={route.id}></DeleteRoute>
            </div>
          ))}
    </div>
  );
}
