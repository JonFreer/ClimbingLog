import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api-client";
import { MutationConfig } from "../../../lib/react-query";
import { getCircuitsQueryOptions } from "./get-circuits";

export const deleteCircuit = ({ circuit_id }: { circuit_id: string }) => {
  return api.delete(`/circuits/${circuit_id}`);
};

type UseDeleteCircuitOptions = {
  mutationConfig?: MutationConfig<typeof deleteCircuit>;
};

export const useDeleteCircuit = ({
  mutationConfig,
}: UseDeleteCircuitOptions) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: getCircuitsQueryOptions().queryKey,
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: deleteCircuit,
  });
};
