import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Gate, GateStatus } from "@/types";

export function useGates(facilityId = 1) {
  return useQuery({
    queryKey: ["gates", facilityId],
    queryFn: async () => {
      const { data } = await api.get<Gate[]>("/gates", { params: { facilityId } });
      return data;
    },
    refetchInterval: 5000,
  });
}

export function useUpdateGateStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: GateStatus }) => {
      const { data } = await api.patch(`/gates/${id}/status`, { status });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["gates"] }),
  });
}
