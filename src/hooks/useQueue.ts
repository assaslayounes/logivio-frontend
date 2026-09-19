import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { QueueEntry, DashboardStats, CheckinScanResult, QueueType } from "@/types";

export function useQueueEntries(facilityId = 1, type: QueueType = "dock") {
  return useQuery({
    queryKey: ["queue", facilityId, type],
    queryFn: async () => {
      const { data } = await api.get<QueueEntry[]>("/queue", { params: { facilityId, type } });
      return data;
    },
    refetchInterval: 5000, // طابور حي يُحدَّث كل 5 ثوانٍ
  });
}

export function useRemoveFromQueue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.patch(`/queue/${id}/remove`);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["queue"] }),
  });
}

export function useDashboardStats(facilityId = 1, date: string) {
  return useQuery({
    queryKey: ["dashboard-stats", facilityId, date],
    queryFn: async () => {
      const { data } = await api.get<DashboardStats>("/dashboard/stats", { params: { facilityId, date } });
      return data;
    },
    refetchInterval: 10000,
  });
}

// حالة حية لموعد واحد عبر رمز QR - يستخدمها كل من السائق (للتتبع) والحارس (عند المسح)
export function useCheckinStatus(qrCode: string | null, opts?: { poll?: boolean }) {
  return useQuery({
    queryKey: ["checkin-status", qrCode],
    queryFn: async () => {
      const { data } = await api.get<CheckinScanResult>(`/checkins/scan/${qrCode}`);
      return data;
    },
    enabled: !!qrCode,
    refetchInterval: opts?.poll ? 5000 : false,
    retry: false,
  });
}

// المرحلة الأولى: الوصول الفيزيائي - يوزَّع تلقائيًا على أقل بوابة ازدحامًا
export function useArriveAtGate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (checkinId: number) => {
      const { data } = await api.patch<{ message: string; gateId: number; queued: boolean }>(
        `/checkins/${checkinId}/arrive`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checkin-status"] });
      queryClient.invalidateQueries({ queryKey: ["gates"] });
      queryClient.invalidateQueries({ queryKey: ["queue"] });
    },
  });
}

// المرحلة الثانية: تأكيد الدخول الفعلي عند نافذة البوابة (تحرّر البوابة، وتفحص الرصيف)
export function useCheckinEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (checkinId: number) => {
      const { data } = await api.patch(`/checkins/${checkinId}/entry`, {});
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checkin-status"] });
      queryClient.invalidateQueries({ queryKey: ["queue"] });
      queryClient.invalidateQueries({ queryKey: ["docks"] });
      queryClient.invalidateQueries({ queryKey: ["gates"] });
    },
  });
}

export function useStartOperation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (checkinId: number) => {
      const { data } = await api.patch(`/checkins/${checkinId}/start`);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["checkin-status"] }),
  });
}

export function useFinishOperation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (checkinId: number) => {
      const { data } = await api.patch(`/checkins/${checkinId}/finish`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checkin-status"] });
      queryClient.invalidateQueries({ queryKey: ["docks"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

export function useLogDelayReason() {
  return useMutation({
    mutationFn: async ({
      checkinId,
      reasonCategory,
      delayMinutes,
    }: {
      checkinId: number;
      reasonCategory: string;
      delayMinutes: number;
    }) => {
      const { data } = await api.post(`/checkins/${checkinId}/delay-reason`, { reasonCategory, delayMinutes });
      return data;
    },
  });
}
