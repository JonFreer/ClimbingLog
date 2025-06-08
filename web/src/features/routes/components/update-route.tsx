import { useNotifications, Notification } from '@/components/ui/notifications';
import { useUpdateRoute } from '../api/update-route';
import { Circuit, Route, Set } from '@/types/routes';
import RouteModal from './route-modal';
import { useState } from 'react';
import { PencilIcon } from '@heroicons/react/24/outline';
type EditRouteProps = {
  set: Set;
  circuit: Circuit;
  route: Route;
};

export const UpdateRoute = ({ set, circuit, route }: EditRouteProps) => {
  const [open, setOpen] = useState(false);

  const { addNotification } = useNotifications();

  const updateRouteMutation = useUpdateRoute({
    mutationConfig: {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'Route Updated',
        } as Notification);
        setOpen(false);
      },
      onError: (error) => {
        addNotification({
          type: 'error',
          title: 'Route Update Failed',
          message: error.message,
        } as Notification);
      },
    },
  });

  return (
    <>
      <button
        className="ml-auto text-gray-300 p-2 hover:text-gray-700 hover:bg-gray-200 rounded-md"
        onClick={() => {
          setOpen(true);
        }}
      >
        <PencilIcon aria-hidden="true" className="h-5 w-5" />
      </button>
      <RouteModal
        set={set}
        circuit={circuit}
        route={route}
        open={open}
        setRoute={updateRouteMutation}
        setOpen={(open: boolean) => setOpen(open)}
      />
    </>
  );
};
