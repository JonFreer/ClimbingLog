import { useNotifications } from '../../../components/ui/notifications';
import { useCreateRoute } from '../api/create-route';
import RouteModal from './route-modal';
import { useRoutes } from '../api/get-routes';
import { useCircuits } from '../../circuits/api/get-circuits';
import { colors } from '../../../types/colors';
import { useState } from 'react';

type CreateRouteProps = {
  set_id: string;
  circuit_id: string;
};

export const CreateRoute = ({ set_id, circuit_id }: CreateRouteProps) => {
  const [open, setOpen] = useState(false);
  const routes = useRoutes().data || [];
  const circuits = useCircuits().data?.data || {};

  const { addNotification } = useNotifications();

  const createRouteMutation = useCreateRoute({
    mutationConfig: {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'Route Created',
        });
        setOpen(false);
      },
      onError: (error) => {
        addNotification({
          type: 'error',
          title: 'Route Creation Failed',
          message: error.message,
        });
      },
    },
  });

  return (
    <>
      <span
        className={
          'ml-2 px-2 text-sm py-2 rounded-lg font-bold text-white cursor-pointer ' +
          (circuits[circuit_id] ? colors[circuits[circuit_id].color] : '')
        }
        onClick={() => {
          setOpen(true);
        }}
      >
        New Route
      </span>
      <RouteModal
        routes={routes}
        circuits={circuits}
        set_id={set_id}
        circuit_id={circuit_id}
        route={null}
        open={open}
        setRoute={createRouteMutation}
        setOpen={(open: boolean) => setOpen(open)}
      />
    </>
  );
};
