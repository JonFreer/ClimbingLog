import { useEffect, useRef, useState } from "react";
import { Circuit, Route, User } from "../types/routes";
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
import { colors } from "../types/colors";
import DraggableDotsCanvas, { Dot } from "./map";
import DangerDialog from "./modal-dialogs";
import { AddCircuit } from "./modals/add_circuit";

export function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [circuits, setCircuits] = useState<Record<string, Circuit>>({});

  const [circuiteModalOpen, setCircuitsModalOpen] = useState<boolean>(false);
  const [deleteCircuitModalOpen, setDeleteCircuitModalOpen] = useState<string>("");

  

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

  function updateUsers() {
    fetch("api/admin/users/get_all", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => setUsers(data))
      .catch((error) => console.error("Error fetching users:", error));
  }

  useEffect(() => {
    updateUsers();
    updateCircuits();
  }, []);

  const promoteUser = (user_id: string) => {
    fetch(`api/admin/users/promote/${user_id}`, {
      method: "POST",
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
        updateUsers();
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const promoteRouteSetter = (user_id: string) => {
    fetch(`api/admin/users/promote/route_setter/${user_id}`, {
      method: "POST",
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
        updateUsers();
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const demoteRouteSetter = (user_id: string) => {
    fetch(`api/admin/users/demote/route_setter/${user_id}`, {
      method: "POST",
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
        updateUsers();
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const demoteUser = (user_id: string) => {
    fetch(`api/admin/users/demote/${user_id}`, {
      method: "POST",
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
        updateUsers();
      })
      .catch((error) => {
        console.error(error);
      });
  };

    const removeCircuit = (circuit_id:string) => {
      fetch(`api/circuits/remove/${circuit_id}`, {
        method: "DELETE",
        headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
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
          updateCircuits();
          setDeleteCircuitModalOpen('');
        })
        .catch((error) => {
        console.error(error);
        });
    };
  

  return (
    <div className="m-5">
      <AddCircuit open={circuiteModalOpen} setOpen={setCircuitsModalOpen} />
      <DangerDialog title={"Delete circuit"} 
                body={"Are you sure you want to delete this circuit? This circuit will be removed for everybody and all routes belonging to it."} 
                actionCallback={()=>removeCircuit(deleteCircuitModalOpen)}
                cancleCallback={()=>setDeleteCircuitModalOpen('')}
                open={deleteCircuitModalOpen!==""}
                action_text="Delete circuit"/>
      
      
      <div className="flex items-center">
        <span className="font-bold text-2xl mt-4">Circuits</span>
        <button
          onClick={() => setCircuitsModalOpen(true)}
          className="ml-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-700 hover:to-blue-900 text-white font-bold py-2 px-4 rounded shadow-lg transform transition-transform duration-300 hover:scale-105"
        >
          Add Circuit
        </button>
      </div>

      <div>
        {Object.values(circuits).map((circuit) => (
          <div
            key={circuit.id}
            className="flex items-center w-full shadow rounded-lg mt-2"
          >
            <span
              className={
                "text-lg font-bold text-white uppercase px-2 py-2 pr-10 w-52 text-center rounded-l-lg clip-path truncate " +
                (colors[circuit.color] || "")
              }
            >
              {circuit.name}
            </span>
            <span className="p-2">{circuit.name}</span>
            <button
              className="mr-2 ml-auto text-gray-400 p-2 hover:text-gray-700 hover:bg-gray-100 rounded-md z-10"
              onClick={() => setDeleteCircuitModalOpen(circuit.id)}
            >
              <TrashIcon aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>

      <h1 className="font-bold text-2xl mt-4">Users: {users.length}</h1>

      <div className="grid grid-cols-1 gap-4">
        {users.map((user) => (
          <div
            key={user.username}
            className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between"
          >
            <div>
              <p className="font-semibold">
                <span
                  className={`mr-4 px-2 py-1 rounded-full text-xs font-medium ${
                    user.is_superuser
                      ? "bg-green-100 text-green-800"
                      : user.route_setter
                      ? "bg-purple-100 text-purple-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {user.is_superuser
                    ? "Admin"
                    : user.route_setter
                    ? "Route Setter"
                    : "User"}
                </span>
                {user.username}
              </p>
              <p className="text-gray-500">{user.email} </p>
            </div>
            <div>
              {user.route_setter ? (
                <button
                  onClick={() => demoteRouteSetter(user.id)}
                  className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-md z-50"
                >
                  <WrenchIcon className="h-5 w-5 text-red-500" />
                </button>
              ) : (
                <button
                  onClick={() => promoteRouteSetter(user.id)}
                  className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-md z-50"
                >
                  <WrenchIcon className="h-5 w-5 text-purple-500" />
                </button>
              )}

              {user.is_superuser ? (
                <button
                  onClick={() => demoteUser(user.id)}
                  className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-md z-50"
                >
                  <ArrowUpCircleIcon className="h-5 w-5 text-red-500" />
                </button>
              ) : (
                <button
                  onClick={() => promoteUser(user.id)}
                  className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-md z-50"
                >
                  <ArrowUpCircleIcon className="h-5 w-5 text-green-500" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
