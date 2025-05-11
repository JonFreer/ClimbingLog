import { useRef, useState } from "react";
import { api } from "../../../lib/api-client";
import { useUser } from "../../../lib/auth";

export function UserNameInput({
  error,
  defaultValue,
}: {
  error: boolean;
  defaultValue: string;
}) {
  const currentInput = useRef("");
  const user = useUser();
  const [usernameAvailable, setUsernameAvailable] = useState(true);

  const checkUsername = async (username: string) => {
    currentInput.current = username;
    const res = await api.get(`/users/valid_user_name/${username}`);
    if (user.data?.username === username) {
      setUsernameAvailable(true);
    } else if (currentInput.current === username) {
      setUsernameAvailable(res);
    }
  };

  return (
    <>
      <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
        @
        <div className="shrink-0 select-none text-base text-gray-500 sm:text-sm/6"></div>
        <input
          onChange={(event) => {
            checkUsername(event.target.value);
          }}
          id="username"
          name="username"
          type="text"
          placeholder="janesmith"
          defaultValue={defaultValue}
          className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline-0 " //sm:text-sm/6
        />
      </div>

      {(!usernameAvailable || error) && (
        <div className="flex bg-red-50 p-3 m-2 rounded-md">
          <div className="text-red-800 text-sm p-2">
            A user with this username already exists.
          </div>
        </div>
      )}
    </>
  );
}
