import { useEffect, useState } from "react";
import { Circuit, Route } from "../types/routes";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { colors } from "../types/colors";

export function AdminPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [circuits, setCircuits] = useState<Circuit[]>([]);

  const [routeModalOpen, setRouteModalOpen] = useState<string>("");
  const [circuiteModalOpen, setCircuitsModalOpen] = useState<boolean>(false);

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


  return (
    <div className="m-5">
      <AddRow circuit_id={routeModalOpen} setOpen={setRouteModalOpen} />
      <AddCircuit open={circuiteModalOpen} setOpen={setCircuitsModalOpen} />
      
      <div className="flex gap-4 mt-5">
      <h1 className="font-bold text-3xl">Admin</h1>
        <button onClick={()=> setCircuitsModalOpen(true)} className="ml-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-700 hover:to-blue-900 text-white font-bold py-2 px-4 rounded shadow-lg transform transition-transform duration-300 hover:scale-105">
          Add Circuit
        </button>
      </div>
      <h1 className="font-bold text-1xl mt-4">Circuits</h1>
      <div>
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

            <span className={ "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium text-white ml-4 " + (colors[circuit.color] || "")}>
                {routes
                  .filter((route) => route.circuit_id === circuit.id).length} Routes
            </span>
            </button>
            {circuit.open && (
              <div className="ml-4 mt-2">
                {routes
                  .filter((route) => route.circuit_id === circuit.id)
                  .map((route) => (
                    <div
                      key={route.id}
                      className="bg-gray-100 p-2 rounded mt-1"
                    >
                      {route.name}
                    </div>
                  ))}
                <button
                  className="inline-flex w-full justify-center rounded-md bg-violet-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-500 sm:w-auto mt-3 ml-auto"
                  onClick={() => setRouteModalOpen(circuit.id)}
                >
                  Add Route
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AddRow(props: {
  circuit_id: string;
  setOpen: (value: string) => void;
}) {

  const open = props.circuit_id !== "";
   
  const [formData, setFormData] = useState<{name:string, location:string, grade:string, style:string, img:File | null}>({
    name: "",
    location: "",
    grade: "",
    style: "",
    img: null, 
  });

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
    formDataToSend.append("location", formData.location);
    formDataToSend.append("grade", formData.grade);
    formDataToSend.append("style", formData.style);
    formDataToSend.append("circuit_id", props.circuit_id);

    if (formData.img == null){
        return;
    }

    formDataToSend.append("file", formData.img);

    fetch("api/routes/create_with_image", {
      method: "POST",
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
        props.setOpen("");
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <Dialog open={open} onClose={()=>props.setOpen("")} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            <form action="#" method="POST" className="space-y-6" onSubmit={handleSubmit}>
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
                      Add a new route
                    </DialogTitle>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 ">
                        Add a new route to the circuit
                      </p>
                    </div>
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
                      <div className="mt-2">
                        <input
                          id="location"
                          name="location"
                          required
                          className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div>
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
                          required
                          className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="style"
                          className="block text-sm/6 font-medium text-gray-900"
                        >
                          Style
                        </label>
                      </div>
                      <div className="mt-2">
                        <input
                          id="style"
                          name="style"
                          required
                          className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div>
                      <ImageUpload imageCallback={(image)=>{setFormData({ ...formData,"img":image})}}></ImageUpload>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="submit"
                //   onClick={() => props.setOpen("")}
                  className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:ml-3 sm:w-auto"
                >
                  Add
                </button>
                <button
                  type="button"
                  data-autofocus
                  onClick={() => props.setOpen("")}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
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

function ImageUpload(props:{imageCallback: (image: File) => void}) {
  const [preview, setPreview] = useState<string | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        props.imageCallback(file);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="px-4 pt-6">
      <div
        id="image-preview"
        className="max-w-sm p-6 mb-4 bg-gray-100 border-dashed border-2 border-gray-400 rounded-lg items-center mx-auto text-center cursor-pointer"
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
              <p className="font-normal text-sm text-gray-400 md:px-6">
                and should be in{" "}
                <b className="text-gray-600">JPG, PNG, or GIF</b> format.
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



export function AddCircuit(props: {
    open: boolean;
    setOpen: (value: boolean) => void;
  }) {
  
    const open = props.open
     
    const [formData, setFormData] = useState<{name:string, color:string}>({
      name: "",
      color: "",
    });
  
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
      formDataToSend.append("color", formData.color);

      fetch("api/circuits/create", {
        method: "POST",
        body: formDataToSend
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
          props.setOpen(false);
        })
        .catch((error) => {
          console.error(error);
        });
    };
  
    return (
      <Dialog open={open} onClose={()=>props.setOpen(false)} className="relative z-10">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
        />
  
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
            >
              <form action="#" method="POST" className="space-y-6 w-full" onSubmit={handleSubmit}>
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    {/* <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:size-10">
                      <ExclamationTriangleIcon aria-hidden="true" className="size-6 text-red-600" />
                    </div> */}
                    <div className="w-full mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <DialogTitle
                        as="h3"
                        className="text-base font-semibold text-gray-900"
                      >
                        Add a new circuit
                      </DialogTitle>
                      <div className="mt-2 mb-4">
                        {/* <p className="text-sm text-gray-500 w-100%">
                          Add a new route to the circuit
                        </p> */}
                      </div>
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
                            required
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            onChange={handleChange}
                          />
                        </div>
                      </div>
  
                      <div>
                        <div className="flex items-center justify-between">
                          <label
                            htmlFor="color"
                            className="block text-sm/6 font-medium text-gray-900"
                          >
                            Color
                          </label>
                        </div>
                        <div className="mt-2">
                          <input
                            id="color"
                            name="color"
                            required
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            onChange={handleChange}
                          />
                        </div>
                      </div>
  
        
                     
                  
                    </div>
                  </div>
                </div>
  
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="submit"
                  //   onClick={() => props.setOpen("")}
                    className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:ml-3 sm:w-auto"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    data-autofocus
                    onClick={() => props.setOpen(false)}
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
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