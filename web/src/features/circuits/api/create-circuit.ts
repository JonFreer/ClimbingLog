import { useMutation, useQueryClient } from "@tanstack/react-query";
import { date, z } from "zod";

import { api } from "../../../lib/api-client";
import { MutationConfig } from "../../../lib/react-query";
import { Set } from "../../../types/routes";

import { getCircuitsQueryOptions } from "./get-circuits";

export const createCircuitInputSchema = z.object({
  name: z.string().min(1, "Required"),
  color: z.string().min(1, "Required"),
});

export type CreateCircuitInput = z.infer<typeof createCircuitInputSchema>;

export const createCircuit = ({
  data,
}: {
  data: CreateCircuitInput;
}): Promise<Set> => {
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("color", data.color);
  return api.post("/circuits/create", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

type UseCreateCircuitOptions = {
  mutationConfig?: MutationConfig<typeof createCircuit>;
};

export const useCreateCircuit = ({
  mutationConfig,
}: UseCreateCircuitOptions) => {
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
    mutationFn: createCircuit,
  });
};
