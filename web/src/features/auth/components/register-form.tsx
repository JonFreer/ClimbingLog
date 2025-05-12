import { NavLink } from 'react-router';
import { useRegister } from '../../../lib/auth';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { api } from '../../../lib/api-client';
import { useRef, useState } from 'react';
import { UserNameInput } from '../../../components/ui/form/username';

type RegisterFormProps = {
  onSuccess: () => void;
};

export const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
  const registering = useRegister({
    onSuccess,
  });

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img alt="VolumeDB" src="/logo.svg" className="mx-auto h-10 w-auto" />
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
            deleted at any point and you will have to reregister.{' '}
          </div>
        </div>

        <form
          className="space-y-6"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const values = Object.fromEntries(formData.entries()) as {
              username: string;
              email: string;
              password: string;
            };
            registering.mutate(values);
          }}
        >
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-900"
            >
              Username
            </label>
            <div className="mt-2">
              <UserNameInput
                error={
                  registering.isError &&
                  (registering.error as any)?.response?.data?.detail ===
                    'REGISTER_USERNAME_ALREADY_EXISTS'
                }
                defaultValue=""
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-900"
            >
              Email address
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                required
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-indigo-600"
              />
            </div>
          </div>

          {registering.isError &&
            (registering.error as any)?.response?.data?.detail ===
              'REGISTER_USER_ALREADY_EXISTS' && (
              <div className="flex bg-red-50 p-3 m-2 rounded-md">
                <div className="text-red-800 text-sm p-2">
                  A user with this email already exists.
                </div>
              </div>
            )}

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-900"
            >
              Password
            </label>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                required
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-indigo-600"
              />
            </div>
          </div>

          {registering.isError &&
            (registering.error as any)?.response?.data?.detail?.code ===
              'REGISTER_INVALID_PASSWORD' && (
              <div className="flex bg-red-50 p-3 m-2 rounded-md">
                <div className="text-red-800 text-sm p-2">
                  {(registering.error as any)?.response?.data?.detail?.reason}
                </div>
              </div>
            )}

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-indigo-600"
            >
              Register
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm/6 text-gray-500">
          Already have an account?{' '}
          <NavLink
            to="/login"
            className="font-semibold text-indigo-600 hover:text-indigo-500"
          >
            Click here to login
          </NavLink>
        </p>
      </div>
    </div>
  );
};
