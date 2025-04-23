import { useNotifications } from "../../../components/ui/notifications";
import { useCreateRoute } from "../api/create-route";
import { Route } from "../../../types/routes";
import RouteModal from "./route-modal";
import { useRoutes } from "../api/get-routes";
import { useCircuits } from "../../circuits/api/get-circuits";
import { colors } from "../../../types/colors";
import { useState } from "react";

type CreateRouteProps = {
  set_id: string;
  circuit_id: string;
};

export const CreateRoute = ({ set_id, circuit_id }: CreateRouteProps) => {
  const [open, setOpen] = useState(false);
  const { data: routes } = useRoutes();
  const { data: circuits } = useCircuits();

  const { addNotification } = useNotifications();

  const createRouteMutation = useCreateRoute({
    mutationConfig: {
      onSuccess: () => {
        addNotification({
          type: "success",
          title: "Route Created",
        });
        setOpen(false);
      },
      onError: (error) => {
        addNotification({
          type: "error",
          title: "Route Creation Failed",
          message: error.message,
        });
      },
    },
  });

  return (
    <>
      <span
        className={
          "ml-2 px-2 text-sm py-2 rounded-lg font-bold text-white cursor-pointer " +
          (circuits?.data[circuit_id]
            ? colors[circuits.data[circuit_id].color]
            : "")
        }
        onClick={() => {
          setOpen(true);
        }}
      >
        + Route
      </span>
      <RouteModal
        routes={routes?.data || []}
        circuits={circuits?.data || {}}
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
