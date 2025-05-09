import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { useUserListState } from "./userlist-state";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";

export function UserListModal() {
  const { userList, closeUserList } = useUserListState();
  const [users, setUsers] = useState(userList);

  useEffect(() => {
    if (userList.length > 0) {
      setUsers(userList);
    }
  }, [userList]);
  return (
    <Dialog
      open={userList.length > 0}
      onClose={() => closeUserList()}
      className="relative z-150"
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-leave:duration-200 data-enter:ease-out data-leave:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full  justify-center text-center items-center p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-leave:duration-200 data-enter:ease-out data-leave:ease-in my-8 w-[90%] sm:max-w-lg sm:data-closed:translate-y-0 sm:data-closed:scale-95"
          >
            <div className="w-full bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="w-full sm:flex sm:items-start">
                <div className="mt-0 w-full text-left sm:ml-4 sm:mt-0 sm:text-left">
                  <div className="mt-2 w-full divide-y divide-gray-100">
                    {users.map((user) => (
                      <div className="p-2" key={user.id}>
                        <a
                          href={`/profile/${user.username}`}
                          className="font-semibold text-slate-700 rounded-sm cursor-pointer w-full p-2 hover:bg-gray-100 m-auto flex"
                        >
                          {user.has_profile_photo ? (
                            <img
                              className="w-10 h-10 rounded-full"
                              src={"/api/profile_photo/" + user.id}
                            ></img>
                          ) : (
                            <UserCircleIcon
                              aria-hidden="true"
                              className="size-10 text-gray-300"
                            />
                          )}
                          <span className="ml-4 flex items-center">
                            {user.username}
                          </span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
