import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Appointment, CreateAppointmentInput, RescheduleInput } from "@/types";

export function useAppointments(date: string, facilityId = 1) {
  return useQuery({
    queryKey: ["appointments", date, facilityId],
    queryFn: async () => {
      const { data } = await api.get<Appointment[]>("/appointments", { params: { date, facilityId } });
      return data;
    },
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateAppointmentInput) => {
      const { data } = await api.post<{ id: number; qrCode: string }>("/appointments", input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.patch(`/appointments/${id}/cancel`);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["appointments"] }),
  });
}

export function useRescheduleAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: RescheduleInput) => {
      const { data } = await api.patch<Appointment>(`/appointments/${id}/reschedule`, body);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["appointments"] }),
  });
}
