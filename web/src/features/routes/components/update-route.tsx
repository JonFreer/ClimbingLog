import { useNotifications } from '@/components/ui/notifications';
import { useUpdateRoute } from '../api/update-route';
import { Route } from '@/types/routes';
import RouteModal from './route-modal';
import { useRoutes } from '../api/get-routes';
import { useCircuits } from '../../circuits/api/get-circuits';
import { colors } from '@/types/colors';
import { useState } from 'react';
import { PencilIcon } from '@heroicons/react/24/outline';
type EditRouteProps = {
  set_id: string;
  circuit_id: string;
  route: Route;
};

export const UpdateRoute = ({ set_id, circuit_id, route }: EditRouteProps) => {
  const [open, setOpen] = useState(false);
  const { data: routes } = useRoutes();
  const { data: circuits } = useCircuits();

  const { addNotification } = useNotifications();

  const updateRouteMutation = useUpdateRoute({
    mutationConfig: {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'Route Updated',
        });
        setOpen(false);
      },
      onError: (error) => {
        addNotification({
          type: 'error',
          title: 'Route Update Failed',
          message: error.message,
        });
      },
    },
  });

  return (
    <>
      <button
        className="ml-auto text-gray-300 p-2 hover:text-gray-700 hover:bg-gray-200 rounded-md"
        onClick={
          (e) => {
            setOpen(true);
          } // Change to setOpen(true) to open the modal
        }
      >
        <PencilIcon aria-hidden="true" className="h-5 w-5" />
      </button>
      <RouteModal
        routes={routes?.data || []}
        circuits={circuits?.data || {}}
        set_id={set_id}
        circuit_id={circuit_id}
        route={route}
        open={open}
        setRoute={updateRouteMutation}
        setOpen={(open: boolean) => setOpen(open)}
      />
    </>
  );
};
