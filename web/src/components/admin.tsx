import {
  ArrowUpCircleIcon,
  WrenchIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { useAllUsers } from '../features/admin/api/get-all-users';
import { usePromoteSuperUser } from '../features/admin/api/promote-super-user';
import { useDemoteSuperUser } from '../features/admin/api/demote-super-user';
import { useDemoteRouteSetter } from '../features/admin/api/demote-route-setter';
import { usePromoteRouteSetter } from '../features/admin/api/promote-route-setter';

export function AdminPage() {
  const users = useAllUsers().data || [];

  const promoteSuperUserMutation = usePromoteSuperUser({
    mutationConfig: {
      onSuccess: () => {},
    },
  });

  const demoteSuperUserMutation = useDemoteSuperUser({
    mutationConfig: {
      onSuccess: () => {},
    },
  });

  const promoteRouteSetterMutation = usePromoteRouteSetter({
    mutationConfig: {
      onSuccess: () => {},
    },
  });

  const demoteRouteSetterMutation = useDemoteRouteSetter({
    mutationConfig: {
      onSuccess: () => {},
    },
  });

  return (
    <div className="m-5 sm:mb-8 mb-14">
      <h1 className="font-bold text-2xl mt-4">Users: {users.length}</h1>

      <div className="grid grid-cols-auto gap-4">
        {users.map((user) => (
          <a
            href={`/profile/${user.username}`}
            key={user.username}
            className="bg-white p-4 rounded-lg shadow-md flex "
          >
            <div className="mr-4">
              {user.has_profile_photo ? (
                <img
                  className="h-10 w-10 rounded-full"
                  src={`/api/profile_photo/${user.id}`}
                  alt=""
                />
              ) : (
                <UserCircleIcon className="h-10 w-10 text-gray-400" />
              )}
            </div>

            <div>
              <p className="font-semibold">
                <span
                  className={`mr-4 px-2 py-1 rounded-full text-xs font-medium ${
                    user.is_superuser
                      ? 'bg-green-100 text-green-800'
                      : user.route_setter
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {user.is_superuser
                    ? 'Admin'
                    : user.route_setter
                    ? 'Route Setter'
                    : 'User'}
                </span>
                {user.username}
              </p>
              <p className="text-gray-500">{user.email} </p>
            </div>
            <div className="ml-auto">
              {user.route_setter ? (
                <button
                  onClick={(e) => {
                    demoteRouteSetterMutation.mutate({ user_id: user.id });
                    e.preventDefault();
                  }}
                  className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-md z-50"
                >
                  <WrenchIcon className="h-5 w-5 text-red-500" />
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    promoteRouteSetterMutation.mutate({ user_id: user.id });
                    e.preventDefault();
                  }}
                  className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-md z-50"
                >
                  <WrenchIcon className="h-5 w-5 text-purple-500" />
                </button>
              )}

              {user.is_superuser ? (
                <button
                  onClick={(e) => {
                    e.preventDefault(); // Prevent the default anchor behavior
                    demoteSuperUserMutation.mutate({ user_id: user.id });
                  }}
                  className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-md z-50"
                >
                  <ArrowUpCircleIcon className="h-5 w-5 text-red-500" />
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    promoteSuperUserMutation.mutate({ user_id: user.id });
                    e.preventDefault();
                  }}
                  className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-md z-50"
                >
                  <ArrowUpCircleIcon className="h-5 w-5 text-green-500" />
                </button>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
