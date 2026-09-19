import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Facility {
  id: number;
  name: string;
  owner_name: string | null;
  owner_phone: string | null;
  address: string | null;
  working_hours_start: string;
  working_hours_end: string;
  max_trucks_per_day: number;
}

export interface UpdateFacilityInput {
  name?: string;
  ownerName?: string;
  ownerPhone?: string;
  address?: string;
  workingHoursStart?: string;
  workingHoursEnd?: string;
  maxTrucksPerDay?: number;
}

export function useFacility(facilityId = 1) {
  return useQuery({
    queryKey: ["facility", facilityId],
    queryFn: async () => {
      const { data } = await api.get<Facility>(`/facilities/${facilityId}`);
      return data;
    },
  });
}

export function useUpdateFacility(facilityId = 1) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateFacilityInput) => {
      const { data } = await api.patch<Facility>(`/facilities/${facilityId}`, input);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["facility", facilityId] }),
  });
}
