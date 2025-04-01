import React, { useState } from "react";
import { NavLink } from "react-router";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export function Register() {
  const [emailError, setEmailError] = useState(false);
  const [usernameError, setUserNameError] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setEmailError(false);
    setUserNameError(false);
    e.preventDefault();
    fetch("api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else if (response.status === 400) {
          return response.json().then((errorData) => {
            if (errorData.detail === "REGISTER_USER_ALREADY_EXISTS") {
              setEmailError(true);
            }
            if (errorData.detail === "REGISTER_USERNAME_ALREADY_EXISTS") {
              setUserNameError(true);
            }
            throw new Error(errorData.detail);
          });
        } else {
          throw new Error("Network response was not ok");
        }
      })
      .then((data) => {
        console.log("Success:", data);
        localStorage.setItem("token", data.access_token);
        // props.onSuccess(data.access_token);
        window.location.href = "/login";
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <>
      {/*
          This example requires updating your template:
  
          ```
          <html class="h-full bg-white">
          <body class="h-full">
          ```
        */}
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            alt="Your Company"
            src="/logo.svg"
            className="mx-auto h-10 w-auto"
          />
          <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
            Register for an account <br />
            (Beta Tester)
          </h2>
        </div>

        <div className="mt-1 sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="flex bg-yellow-50 p-3 m-2 rounded-md">
            <div className="p-2">
              <ExclamationTriangleIcon
                aria-hidden="true"
                className="size-5 mt-5 text-yellow-400"
              />
            </div>
            <div className="ml-2 text-yellow-800 text-sm p-2">
              Warning! This app is still under development. Your data may be
              deleted at any point and you will have to reregister.{" "}
            </div>
          </div>

          <div className="sm:col-span-4">
            <label
              htmlFor="username"
              className="block text-sm/6 font-medium text-gray-900"
            >
              Username
            </label>
            <div className="mt-2">
              <div className="flex items-center rounded-md bg-white pl-3 outline outline-1 -outline-offset-1 outline-gray-300 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                @
                <div className="shrink-0 select-none text-base text-gray-500 sm:text-sm/6"></div>
                <input
                  onChange={handleChange}
                  id="username"
                  name="username"
                  type="text"
                  placeholder="janesmith"
                  className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
                />
              </div>
            </div>
          </div>
          {usernameError ? (
            <div className="flex bg-red-50 p-3 m-2 rounded-md">
              <div className="text-red-800 text-sm p-2">
                A user with this username already exists.
              </div>
            </div>
          ) : (
            <></>
          )}
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form
            action="#"
            method="POST"
            className="space-y-6"
            onSubmit={handleSubmit}
          >
            <div>
              <label
                htmlFor="email"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  onChange={handleChange}
                />
              </div>
            </div>

            {emailError ? (
              <div className="flex bg-red-50 p-3 m-2 rounded-md">
                <div className="text-red-800 text-sm p-2">
                  A user with this email already exists.
                </div>
              </div>
            ) : (
              <></>
            )}

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Password
                </label>
                {/* <div className="text-sm">
                    <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
                      Forgot password?
                    </a>
                  </div> */}
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Register
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm/6 text-gray-500">
            Already have an account?{" "}
            <NavLink
              to="/login"
              className="font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Click here to login
            </NavLink>
          </p>
        </div>
      </div>
    </>
  );
}
