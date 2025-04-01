"use client";

import { useEffect, useRef, useState } from "react";
import { Circuit, Route, Set } from "../types/routes";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import {
  ExclamationTriangleIcon,
  TrashIcon,
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  PencilIcon,
  WrenchIcon,
} from "@heroicons/react/24/outline";
import {
  colors,
  colorsBold,
  colorsBorder,
  colorsFaint,
  colorsPastel,
} from "../types/colors";
import DraggableDotsCanvas, { Dot } from "./map";
import DangerDialog from "./modal-dialogs";
import { AddSet } from "./modals/add_set";

export function RouteSettingPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [circuits, setCircuits] = useState<Record<string, Circuit>>({});
  const [sets, setSets] = useState<Record<string, Set>>({});

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
      const recentSet = Object.values(sets)
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

  function updateRoutes() {
    fetch("api/routes/get_all")
      .then((response) => response.json())
      .then((data) => setRoutes(data))
      .catch((error) => console.error("Error fetching routes:", error));
  }

  function updateCircuits() {
    fetch("api/circuits/get_all")
      .then((response) => response.json())
      .then((data) => {
        const circuitsDict = data.reduce(
          (acc: Record<string, Circuit>, circuit: Circuit) => {
            acc[circuit.id] = circuit;
            return acc;
          },
          {}
        );
        setCircuits(circuitsDict);
      })
      .catch((error) => console.error("Error fetching circuits:", error));
  }

  function updateSets() {
    fetch("api/sets/get_all")
      .then((response) => response.json())
      .then((data) => {
        const setsDict = data.reduce((acc: Record<string, Set>, set: Set) => {
          acc[set.id] = set;
          return acc;
        }, {});
        setSets(setsDict);
      })
      .catch((error) => console.error("Error fetching sets:", error));
  }

  useEffect(() => {
    updateRoutes();
  }, [routeModalOpen]);

  useEffect(() => {
    updateCircuits();
    updateSets();
  }, [setModalOpen]);

  const removeRoute = (route_id: string) => {
    fetch(`api/routes/remove_route/${route_id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else if (response.status === 400) {
          return response.json().then((errorData) => {
            throw new Error(errorData.detail);
          });
        } else {
          throw new Error("Network response was not ok");
        }
      })
      .then((data) => {
        console.log("Success:", data);
        updateRoutes();
        setDeleteRouteModalOpen("");
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <div className="m-5 sm:mb-8 mb-14">
      <AddRow
        set_id={routeModalOpen.set_id}
        circuit_id={openCircuit}
        setOpen={setRouteModalOpen}
        route={routeModalOpen.route}
        routes={routes}
        circuits={circuits}
      />
      <DangerDialog
        title={"Delete route"}
        body={
          "Are you sure you want to delete this route? This route will be removed for everybody and cannot be undone."
        }
        actionCallback={() => removeRoute(deleteRouteModalOpen)}
        cancleCallback={() => setDeleteRouteModalOpen("")}
        open={deleteRouteModalOpen !== ""}
        action_text="Delete route"
      />

      <AddSet
        open={setModalOpen}
        setOpen={setSetModalOpen}
        circuit_id={openCircuit}
      />
      <div className="flex gap-4 mt-5">
        <h1 className="font-bold text-3xl">Route Setting</h1>
      </div>

      <div className=" flex justify-center gap-2 flex-wrap text-white my-4">
        {Object.values(circuits).map((circuit, index, array) => (
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
            {openCircuit && circuits[openCircuit]?.name}{" "}
          </span>
          <span className="ml-auto flex">
            <span className="flex items-center mr-2 ">Set: </span>
            <select
              className="block w-full rounded-md bg-white px-3 py-2.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
              value={selectedSet}
              onChange={(e) => setSelectedSet(e.target.value)}
            >
              {Object.values(sets)
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
              (circuits[openCircuit] ? colors[circuits[openCircuit].color] : "")
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
            {new Date(sets[selectedSet].date).toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </span>
          <span
            className={
              "ml-2 px-2 text-sm py-2 rounded-lg font-bold text-white cursor-pointer " +
              (circuits[openCircuit] ? colors[circuits[openCircuit].color] : "")
            }
            onClick={() =>
              setRouteModalOpen({ set_id: selectedSet, route: null })
            }
          >
            + Route
          </span>
        </div>
      )}

      {selectedSet != "" &&
        routes
          .filter((route) => route.set_id === selectedSet)
          .map((route) => (
            <div
              key={route.id}
              className="bg-gray-100 p-1 flex rounded-sm mt-1"
            >
              <span className="p-2">{route.name}</span>

              <button
                className="ml-auto text-gray-300 p-2 hover:text-gray-700 hover:bg-gray-200 rounded-md"
                onClick={() =>
                  setRouteModalOpen({ set_id: route.set_id, route: route })
                }
              >
                <PencilIcon aria-hidden="true" className="h-5 w-5" />
              </button>
              <button
                className="ml-2 text-gray-300 p-2 hover:text-gray-700 hover:bg-gray-200 rounded-md"
                onClick={() => setDeleteRouteModalOpen(route.id)}
              >
                <TrashIcon aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>
          ))}
    </div>
  );
}

export default function AddRow(props: {
  routes: Route[];
  circuits: Record<string, Circuit>;
  set_id: string;
  circuit_id: string;
  route: Route | null;
  setOpen: (value: { set_id: string; route: null }) => void;
}) {
  const locations = [
    "Smol Slab",
    "Slab",
    "Skip",
    "Cave",
    "Shutter Right",
    "Shutter Left",
    "Comp Wall",
    "Comp Overhang",
    "Fire Escape",
    "Island N",
    "Island S",
    "Island E",
    "Island W",
    "Ondra",
  ];
  const styles_list = [
    "Slab",
    "Vertical",
    "Overhang",
    "Roof",
    "Cave",
    "Arete",
    "Corner",
    "Crack",
    "Dihedral",
    "Mantle",
    "Dyno",
    "Jump",
    "Compression",
    "Slopey",
    "Pinch",
    "Crimp",
    "Jug",
    "Pocket",
    "Sloper",
    "Undercling",
    "Gaston",
    "Heel Hook",
    "Toe Hook",
    "Knee Bar",
    "Mantel",
    "Match",
    "Cross Through",
    "Drop Knee",
    "Lock Off",
    "Deadpoint",
    "Campus",
  ];
  const [location, setLocation] = useState<string>("");
  const [styles, setStyles] = useState<string[]>([]);

  const [dots, setDots] = useState<Dot[]>([
    {
      x: props.route ? props.route.x : 0,
      y: props.route ? props.route.y : 0,
      isDragging: false,
      complete: true,
      radius: 6,
      draggable: true,
      color: "#ff0000",
      id: "",
    },
  ]);

  const open = props.set_id !== "";
  const circuite_name = props.circuits[props.circuit_id]?.name || "";
  const num_routes_in_set = props.routes.filter(
    (route) => route.set_id === props.set_id
  ).length;

  const [formData, setFormData] = useState<{
    name: string;
    grade: string;
    img: File | null;
  }>({
    name: props.route
      ? props.route.name
      : circuite_name[0] + (num_routes_in_set + 1),
    grade: props.route ? props.route.name : "",
    img: null,
  });

  useEffect(() => {
    const circuite_name = props.circuits[props.circuit_id]?.name || "";
    const num_routes_in_set = props.routes.filter(
      (route) => route.set_id === props.set_id
    ).length;
    setLocation(props.route ? props.route.location : "");
    setStyles(props.route ? props.route.style.split(",") : []);
    setFormData({
      name: props.route
        ? props.route.name
        : circuite_name[0] + (num_routes_in_set + 1),
      grade: props.route ? props.route.name : "",
      img: null,
    });
    setDots([
      {
        x: props.route ? props.route.x : 0,
        y: props.route ? props.route.y : 0,
        isDragging: false,
        complete: true,
        radius: 6,
        draggable: true,
        color: "#ff0000",
        id: "",
      },
    ]);
  }, [props.route, props.set_id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("location", location);
    formDataToSend.append("grade", formData.grade);
    formDataToSend.append("style", styles.join(","));
    formDataToSend.append("set_id", props.set_id);
    formDataToSend.append("x", dots[0].x.toString());
    formDataToSend.append("y", dots[0].y.toString());

    if (formData.img == null && !props.route) {
      return;
    }
    if (formData.img) {
      formDataToSend.append("file", formData.img);
    }

    const url = props.route
      ? "api/routes/update"
      : "api/routes/create_with_image";
    const method = props.route ? "PATCH" : "POST";
    if (props.route) {
      formDataToSend.append("route_id", props.route.id);
    }

    fetch(url, {
      method: method,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formDataToSend,
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else if (response.status === 400) {
          return response.json().then((errorData) => {
            throw new Error(errorData.detail);
          });
        } else {
          throw new Error("Network response was not ok");
        }
      })
      .then((data) => {
        console.log("Success:", data);
        // localStorage.setItem("token", data.access_token);
        // // props.onSuccess(data.access_token);
        // window.location.href = "/";
        props.setOpen({ set_id: "", route: null });
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <Dialog
      open={open}
      onClose={() => props.setOpen({ set_id: "", route: null })}
      className="relative z-10"
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-leave:duration-200 data-enter:ease-out data-leave:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-leave:duration-200 data-enter:ease-out data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:data-closed:translate-y-0 sm:data-closed:scale-95"
          >
            <form
              action="#"
              method="POST"
              className="space-y-6"
              onSubmit={handleSubmit}
            >
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  {/* <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:size-10">
                    <ExclamationTriangleIcon aria-hidden="true" className="size-6 text-red-600" />
                  </div> */}
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <DialogTitle
                      as="h3"
                      className="text-base font-semibold text-gray-900"
                    >
                      {props.route ? "Edit Route" : "Add a new route"}
                    </DialogTitle>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 ">
                        {props.route
                          ? "Update properties for existing route"
                          : "Add a new route to the circuit"}
                      </p>
                    </div>

                    <div className="flex mt-3 items-center justify-between">
                      <label
                        htmlFor="name"
                        className="block text-sm/6 font-medium text-gray-900"
                      >
                        Route Location
                      </label>
                    </div>

                    <DraggableDotsCanvas
                      dots={dots}
                      updateDots={(dots) => setDots(dots)}
                      setSelected={(_id) => {}}
                    />
                    <div>
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="name"
                          className="block text-sm/6 font-medium text-gray-900"
                        >
                          Route Name
                        </label>
                      </div>

                      <div className="mt-2">
                        <input
                          id="name"
                          name="name"
                          type="text"
                          defaultValue={
                            props.route
                              ? props.route?.name
                              : circuite_name[0] + (num_routes_in_set + 1)
                          }
                          required
                          className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="location"
                          className="block text-sm/6 font-medium text-gray-900"
                        >
                          Location
                        </label>
                      </div>
                      <div className="mt-2 flex gap-2 flex-wrap grow justify-center">
                        {locations.map((loc) => (
                          <div
                            onClick={() => {
                              setLocation(loc);
                            }}
                            className={
                              "justify-center rounded-md  px-3 py-2 text-sm shadow-md sm:w-auto mb-1 cursor-pointer select-none " +
                              (location === loc
                                ? "bg-violet-600 hover:bg-violet-500 text-white "
                                : "bg-white hover:bg-gray-100 text-gray-500")
                            }
                            key={loc}
                          >
                            {loc}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* <div>
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="grade"
                          className="block text-sm/6 font-medium text-gray-900"
                        >
                          Grade
                        </label>
                      </div>
                      <div className="mt-2">
                        <input
                          id="grade"
                          name="grade"
                          defaultValue={props.route?.grade}
                          required
                          className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                          onChange={handleChange}
                        />
                      </div>
                    </div> */}

                    <div>
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="style"
                          className="block text-sm/6 font-medium text-gray-900"
                        >
                          Style
                        </label>
                      </div>
                      <div className="mt-2 flex gap-2 flex-wrap grow justify-center">
                        {styles_list.map((loc) => (
                          <div
                            onClick={() =>
                              setStyles((prevStyles) =>
                                prevStyles.includes(loc)
                                  ? prevStyles.filter((style) => style !== loc)
                                  : [...prevStyles, loc]
                              )
                            }
                            className={
                              "justify-center rounded-md  px-3 py-2 text-sm shadow-md sm:w-auto mb-1 cursor-pointer select-none " +
                              (styles.includes(loc)
                                ? "bg-violet-600 hover:bg-violet-500 text-white "
                                : "bg-white hover:bg-gray-100 text-gray-500")
                            }
                            key={loc}
                          >
                            {loc}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <ImageUpload
                        imageCallback={(image) => {
                          setFormData({ ...formData, img: image });
                        }}
                        defaultUrl={
                          props.route
                            ? "/api/img/" + props.route.id + ".webp"
                            : ""
                        }
                      ></ImageUpload>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="submit"
                  //   onClick={() => props.setOpen("")}
                  className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-green-500 sm:ml-3 sm:w-auto"
                >
                  {props.route ? "Update Route" : "Add Route"}
                </button>
                <button
                  type="button"
                  data-autofocus
                  onClick={() => props.setOpen({ set_id: "", route: null })}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                >
                  Cancel
                </button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}

function ImageUpload(props: {
  imageCallback: (image: File) => void;
  defaultUrl: string;
}) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    setPreview(props.defaultUrl);
  }, [props.defaultUrl]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result as string;
        //scale and compress the image bbefore sending it to the server
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          const maxHeight = 1920;
          let { width, height } = img;

          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }

          canvas.width = width;
          canvas.height = height;

          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const webpFile = new File([blob], "image.webp", {
                  type: "image/webp",
                });
                console.log(`WebP file size: ${webpFile.size} bytes`);
                setPreview(URL.createObjectURL(webpFile));
                props.imageCallback(webpFile);
              }
            },
            "image/webp",
            0.8 // Compression quality
          );
        };
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="px-4 pt-6">
      <div
        id="image-preview"
        className="max-w-sm p-6 mb-4 bg-gray-100 border-dashed border-1 border-gray-300 rounded-lg items-center mx-auto text-center cursor-pointer"
      >
        <input
          id="upload"
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleImageChange}
        />
        <label htmlFor="upload" className="cursor-pointer">
          {preview ? (
            <img src={preview} alt="Preview" className="mx-auto mb-4" />
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-8 h-8 text-gray-700 mx-auto mb-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
              <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-700">
                Upload picture
              </h5>
              <p className="font-normal text-sm text-gray-400 md:px-6">
                Choose photo size should be less than{" "}
                <b className="text-gray-600">2mb</b>
              </p>

              <span
                id="filename"
                className="text-gray-500 bg-gray-200 z-50"
              ></span>
            </>
          )}
        </label>
      </div>
    </div>
  );
}
