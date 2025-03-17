import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { useState } from "react";

export function AddSet(props: {
    open: boolean;
    circuit_id: string;
    setOpen: (value: boolean) => void;
  }) {
  
    const open = props.open
     
    const [formData, setFormData] = useState<{name:string, date:Date}>({
      name: "",
      date: new Date(),
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
      formDataToSend.append("circuit_id", props.circuit_id);
      formDataToSend.append("date", formData.date.toISOString());

      fetch("api/sets/create", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
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
                        Add a new set
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
                            Set Name
                        </label>
                        </div>
                        <div className="mt-2">
                          <input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Optional"
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
                            Date of reset
                          </label>
                        </div>
                        <div className="mt-2">
                          <input
                            id="date"
                            name="date"
                            type="date"
                            defaultValue={new Date().toISOString().split("T")[0]}
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