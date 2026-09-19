import { useDocks, useUpdateDockStatus } from "@/hooks/useDocks";
import { useGates, useUpdateGateStatus } from "@/hooks/useGates";
import { useAppointments } from "@/hooks/useAppointments";
import { useDashboardStats } from "@/hooks/useQueue";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DockStatus, GateStatus } from "@/types";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

const today = new Date().toISOString().slice(0, 10);

const dockStatusMeta: Record<DockStatus, { label: string; badge: "success" | "danger" | "amber" }> = {
  available: { label: "متاح", badge: "success" },
  busy: { label: "مشغول", badge: "danger" },
  maintenance: { label: "صيانة", badge: "amber" },
};

const gateStatusMeta: Record<GateStatus, { label: string; badge: "success" | "danger" | "amber" }> = {
  available: { label: "متاحة", badge: "success" },
  busy: { label: "مشغولة", badge: "danger" },
  maintenance: { label: "صيانة", badge: "amber" },
};

export function AdminDashboardPage() {
  const { user } = useAuth();
  const facilityId = user?.facilityId ?? 1;
  const { data: stats } = useDashboardStats(facilityId, today);
  const { data: docks } = useDocks(facilityId);
  const { data: gates } = useGates(facilityId);
  const { data: appointments } = useAppointments(today);
  const updateDock = useUpdateDockStatus();
  const updateGate = useUpdateGateStatus();

  const cycleDockStatus = (id: number, current: DockStatus) => {
    const next: Record<DockStatus, DockStatus> = {
      available: "maintenance",
      maintenance: "busy",
      busy: "available",
    };
    updateDock.mutate({ id, status: next[current] }, { onError: (err: Error) => toast.error(err.message) });
  };

  const cycleGateStatus = (id: number, current: GateStatus) => {
    const next: Record<GateStatus, GateStatus> = {
      available: "maintenance",
      maintenance: "busy",
      busy: "available",
    };
    updateGate.mutate({ id, status: next[current] }, { onError: (err: Error) => toast.error(err.message) });
  };

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-ink">لوحة المسؤول</h1>

      <div className="mb-6 grid grid-cols-4 gap-4">
        <StatCard label="شاحنات اليوم" value={stats?.trucksToday ?? "—"} />
        <StatCard label="متوسط الانتظار" value={stats?.avgWaitMinutes != null ? `${stats.avgWaitMinutes} د` : "—"} />
        <StatCard
          label="الالتزام بالمواعيد"
          value={stats?.onTimeRate != null ? `${stats.onTimeRate}%` : "—"}
          tone={stats?.onTimeRate != null && stats.onTimeRate >= 85 ? "success" : undefined}
        />
        <StatCard label="استغلال الأرصفة" value={`${stats?.dockUtilization ?? 0}%`} />
      </div>

      <h2 className="mb-3 text-sm font-semibold text-ink/70">حالة البوابات الآن</h2>
      <div className="mb-6 grid grid-cols-4 gap-4">
        {gates?.map((gate) => {
          const meta = gateStatusMeta[gate.status];
          return (
            <button
              key={gate.id}
              onClick={() => cycleGateStatus(gate.id, gate.status)}
              className="rounded-lg border border-border bg-surface p-4 text-right transition-shadow hover:shadow-sm"
              title="اضغط لتغيير الحالة يدويًا"
            >
              <p className="mb-1.5 text-sm font-medium text-ink">{gate.name}</p>
              <Badge variant={meta.badge}>{meta.label}</Badge>
            </button>
          );
        })}
      </div>

      <h2 className="mb-3 text-sm font-semibold text-ink/70">حالة الأرصفة الآن</h2>
      <div className="mb-6 grid grid-cols-4 gap-4">
        {docks?.map((dock) => {
          const meta = dockStatusMeta[dock.status];
          return (
            <button
              key={dock.id}
              onClick={() => cycleDockStatus(dock.id, dock.status)}
              className="rounded-lg border border-border bg-surface p-4 text-right transition-shadow hover:shadow-sm"
              title="اضغط لتغيير الحالة يدويًا"
            >
              <p className="mb-1.5 text-sm font-medium text-ink">{dock.name}</p>
              <Badge variant={meta.badge}>{meta.label}</Badge>
            </button>
          );
        })}
      </div>

      <h2 className="mb-3 text-sm font-semibold text-ink/70">مواعيد اليوم</h2>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-right text-xs text-ink/50">
                <th className="px-4 py-2.5 font-medium">الوقت</th>
                <th className="px-4 py-2.5 font-medium">الشاحنة</th>
                <th className="px-4 py-2.5 font-medium">الرصيف</th>
                <th className="px-4 py-2.5 font-medium">العملية</th>
                <th className="px-4 py-2.5 font-medium">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {appointments?.length ? (
                appointments.map((a) => (
                  <tr key={a.id} className="border-b border-border last:border-0">
                    <td className="tabular-nums px-4 py-2.5">
                      {new Date(a.scheduled_start).toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-4 py-2.5">
                      {a.plate_number}
                      {a.is_perishable ? <Badge variant="amber" className="mr-2">سريعة التلف</Badge> : null}
                    </td>
                    <td className="px-4 py-2.5">{a.dock_name}</td>
                    <td className="px-4 py-2.5">{a.operation_type === "load" ? "تحميل" : "تفريغ"}</td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={a.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-ink/40">
                    لا توجد مواعيد مسجّلة اليوم
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string | number; tone?: "success" }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="mb-1 text-xs text-ink/50">{label}</p>
        <p className={`text-2xl font-semibold tabular-nums ${tone === "success" ? "text-success" : "text-ink"}`}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: "success" | "danger" | "neutral" | "brand" }> = {
    confirmed: { label: "مؤكد", variant: "brand" },
    completed: { label: "مكتمل", variant: "success" },
    cancelled: { label: "ملغى", variant: "danger" },
    rescheduled: { label: "أُعيدت جدولته", variant: "neutral" },
    no_show: { label: "لم يحضر", variant: "danger" },
  };
  const meta = map[status] ?? { label: status, variant: "neutral" as const };
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}
