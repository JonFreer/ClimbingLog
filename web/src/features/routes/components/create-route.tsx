import { useNotifications, Notification } from '@/components/ui/notifications';
import { useCreateRoute } from '../api/create-route';
import RouteModal from './route-modal';
import { useRoutes } from '../api/get-routes';
import { colors } from '@/types/colors';
import { useState } from 'react';
import { Circuit, Set } from '@/types/routes';

type CreateRouteProps = {
  set: Set;
  circuit: Circuit;
};

export const CreateRoute = ({ set, circuit }: CreateRouteProps) => {
  const [open, setOpen] = useState(false);
  const routes = useRoutes().data || [];

  const { addNotification } = useNotifications();

  const createRouteMutation = useCreateRoute({
    mutationConfig: {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'Route Created',
        } as Notification);
        setOpen(false);
      },
      onError: (error) => {
        addNotification({
          type: 'error',
          title: 'Route Creation Failed',
          message: error.message,
        } as Notification);
      },
    },
  });

  return (
    <>
      <span
        className={
          'ml-2 px-2 text-sm py-2 rounded-lg font-bold text-white cursor-pointer ' +
          (colors[circuit.color] || 'bg-gray-500')
        }
        onClick={() => {
          setOpen(true);
        }}
      >
        New Route
      </span>
      <RouteModal
        circuit={circuit}
        routes={routes}
        set={set}
        route={null}
        open={open}
        setRoute={createRouteMutation}
        setOpen={(open: boolean) => setOpen(open)}
      />
    </>
  );
};
