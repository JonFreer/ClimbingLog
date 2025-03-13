import { useEffect, useRef, useState } from "react";
import { Circuit, Route, User } from "../types/routes";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { ExclamationTriangleIcon, TrashIcon, ArrowDownCircleIcon, ArrowUpCircleIcon, PencilIcon, WrenchIcon } from "@heroicons/react/24/outline";
import { colors } from "../types/colors";
import DraggableDotsCanvas, { Dot } from "./map";
import DangerDialog from "./modal-dialogs";

export function AdminPage() {

  const [users, setUsers] = useState<User[]>([]);

  function updateUsers(){
    fetch("api/admin/users/get_all", {
      headers: {
      "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    })
    .then((response) => response.json())
    .then((data) => setUsers(data))
    .catch((error) => console.error("Error fetching users:", error));
  }

  useEffect(() => {
    updateUsers();
  },[])

  const promoteUser = (user_id:string) => {
    fetch(`api/admin/users/promote/${user_id}`, {
      method: "POST",
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
        updateUsers();
      })
      .catch((error) => {
      console.error(error);
      });
  };

  const promoteRouteSetter = (user_id:string) => {
    fetch(`api/admin/users/promote/route_setter/${user_id}`, {
      method: "POST",
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
        updateUsers();
      })
      .catch((error) => {
      console.error(error);
      });
  };

  const demoteRouteSetter = (user_id:string) => {
    fetch(`api/admin/users/demote/route_setter/${user_id}`, {
      method: "POST",
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
        updateUsers();
      })
      .catch((error) => {
      console.error(error);
      });
  };

  const demoteUser = (user_id:string) => {
    fetch(`api/admin/users/demote/${user_id}`, {
      method: "POST",
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
        updateUsers();
      })
      .catch((error) => {
      console.error(error);
      });
  };


  return (
    <div className="m-5">
     
      <h1 className="font-bold text-1xl mt-4">Users: {users.length}</h1>


      <div className="grid grid-cols-1 gap-4">
      {users.map((user) => (
        <div key={user.username} className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
        <div>
          <p className="font-semibold">
            <span className={`mr-4 px-2 py-1 rounded-full text-xs font-medium ${user.is_superuser ? 'bg-green-100 text-green-800' : user.route_setter? 'bg-purple-100 text-purple-800': 'bg-gray-100 text-gray-800'}`}>
                {user.is_superuser ? "Admin" : user.route_setter ? "Route Setter" :  "User"}
        </span>
        {user.username}</p>
          <p className="text-gray-500">{user.email} </p>
          
        </div>
        <div>
        
        {user.route_setter ? 
              <button onClick={()=>demoteRouteSetter(user.id)}className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-md z-50">
              <WrenchIcon className="h-5 w-5 text-red-500"/>
            </button>
        : 
           <button onClick={()=>promoteRouteSetter(user.id)}className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-md z-50">
            <WrenchIcon className="h-5 w-5 text-purple-500"/>
         </button>
        }

        {user.is_superuser ? 
              <button onClick={()=>demoteUser(user.id)} className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-md z-50">
              <ArrowUpCircleIcon className="h-5 w-5 text-red-500"/>
            </button>
        : 
           <button onClick={()=>promoteUser(user.id)}className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-md z-50">
            <ArrowUpCircleIcon className="h-5 w-5 text-green-500"/>
         </button>
        }
     
   
        </div>

        </div>
      ))}
      </div>
    </div>
  );
}
