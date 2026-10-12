import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Dock, DockStatus } from "@/types";

export function useDocks(facilityId = 1) {
  return useQuery({
    queryKey: ["docks", facilityId],
    queryFn: async () => {
      const { data } = await api.get<Dock[]>("/docks", { params: { facilityId } });
      return data;
    },
    refetchInterval: 8000, // تحديث دوري لحالة الأرصفة كأنها لوحة حية
  });
}

export function useUpdateDockStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: DockStatus }) => {
      const { data } = await api.patch(`/docks/${id}/status`, { status });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["docks"] }),
  });
}

export function useCreateDock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; avgProcessMinutes: number }) => {
      const { data } = await api.post<{ id: number }>("/docks", input);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["docks"] }),
  });
}
