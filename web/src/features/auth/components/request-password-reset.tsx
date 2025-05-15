import { NavLink, useNavigate } from 'react-router';
import { api } from '@/lib/api-client';
import { useNotifications } from '@/components/ui/notifications';

export const RequestPasswordReset = () => {
  const { addNotification } = useNotifications();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img alt="VolumeDB" src="/logo.svg" className="mx-auto h-10 w-auto" />
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
          Reset your password
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form
          action="#"
          method="POST"
          className="space-y-6"
          onSubmit={(event) => {
            event.preventDefault();
            api
              .post('/auth/forgot-password', {
                email: (event.currentTarget as HTMLFormElement).username.value,
              })
              .then(() => {
                addNotification({
                  title: 'Password reset email sent',
                  message:
                    'Please check your email for instructions to reset your password.',
                  type: 'success',
                });
                navigate('/login');
              })
              .catch((error) => {
                console.error('Password reset failed:', error);
              });
          }}
        >
          <div>
            <label
              htmlFor="username"
              className="block text-sm/6 font-medium text-gray-900"
            >
              Email address
            </label>
            <div className="mt-2">
              <input
                id="username"
                name="username"
                type="email"
                required
                autoComplete="email"
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                //   onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Send Email
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm/6 text-gray-500">
          Don't have an account?{' '}
          <NavLink
            to="/register"
            className="font-semibold text-indigo-600 hover:text-indigo-500"
          >
            Click here to register
          </NavLink>
        </p>
      </div>
    </div>
  );
};
