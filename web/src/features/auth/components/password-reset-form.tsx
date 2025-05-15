import { useNotifications } from '@/components/ui/notifications';
import { api } from '@/lib/api-client';
import { useNavigate, useParams } from 'react-router';

export const PasswordResetForm = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img alt="VolumeDB" src="/logo.svg" className="mx-auto h-10 w-auto" />
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
          Reset your password <br />
        </h2>
      </div>
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form
          className="space-y-6 pt-4"
          onSubmit={(event) => {
            event.preventDefault();
            api
              .post('/auth/reset-password', {
                token,
                password: (event.currentTarget as HTMLFormElement).password
                  .value,
              })
              .then(() => {
                addNotification({
                  title: 'Password reset successful',
                  message: 'Your password has been successfully reset.',
                  type: 'success',
                });
                navigate('/login');
              })
              .catch((error) => {
                console.error('Password reset failed:', error);
                addNotification({
                  title: 'Password reset failed',
                  message:
                    'The password reset token is invalid or has expired.',
                  type: 'error',
                });
              });
          }}
        >
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

          {/* {registering.isError &&
            (registering.error as any)?.response?.data?.detail?.code ===
              'REGISTER_INVALID_PASSWORD' && (
              <div className="flex bg-red-50 p-3 m-2 rounded-md">
                <div className="text-red-800 text-sm p-2">
                  {(registering.error as any)?.response?.data?.detail?.reason}
                </div>
              </div>
            )} */}

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-indigo-600"
            >
              Reset Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
