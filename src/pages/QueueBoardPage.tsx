import { useState } from "react";
import { useQueueEntries, useRemoveFromQueue } from "@/hooks/useQueue";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import type { QueueType } from "@/types";
import { useAuth } from "@/context/AuthContext";

const tabs: { value: QueueType; label: string }[] = [
  { value: "dock", label: "طوابير الأرصفة" },
  { value: "gate", label: "طوابير البوابات" },
];

export function QueueBoardPage() {
  const { user } = useAuth();
  const facilityId = user?.facilityId ?? 1;
  const [activeTab, setActiveTab] = useState<QueueType>("dock");
  const { data: entries, isLoading } = useQueueEntries(facilityId, activeTab);
  const removeFromQueue = useRemoveFromQueue();

  const waitMinutes = (arrivalTime: string) =>
    Math.max(0, Math.round((Date.now() - new Date(arrivalTime).getTime()) / 60000));

  // تجميع الشاحنات حسب الرصيف أو البوابة، كل واحد بطابوره الخاص
  const grouped = new Map<string, typeof entries>();
  entries?.forEach((entry) => {
    const key = activeTab === "gate" ? entry.gate_name ?? "—" : entry.expected_dock_name ?? "—";
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(entry);
  });

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-ink">الطابور الحي</h1>
        <span className="text-sm text-ink/50">{entries?.length ?? 0} شاحنات منتظرة</span>
      </div>

      <div className="mb-5 flex gap-1 rounded-md bg-canvas p-1">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab.value ? "bg-surface text-brand shadow-sm" : "text-ink/50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-sm text-ink/50">جارٍ التحميل...</p>
      ) : !entries?.length ? (
        <Card className="p-10 text-center text-ink/40">لا توجد شاحنات منتظرة حاليًا في هذا القسم</Card>
      ) : (
        <div className="flex flex-col gap-5">
          {Array.from(grouped.entries()).map(([groupName, groupEntries]) => (
            <div key={groupName}>
              <p className="mb-2 text-xs font-semibold text-ink/50">{groupName}</p>
              <div className="flex flex-col gap-2.5">
                {groupEntries!.map((entry) => (
                  <Card
                    key={entry.id}
                    className={`flex items-center gap-4 p-4 ${entry.is_perishable ? "border-amber/40" : ""}`}
                  >
                    <span className="w-7 text-center text-lg font-semibold tabular-nums text-ink/40">
                      {entry.queue_position}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink">
                        شاحنة {entry.plate_number}
                        {entry.is_perishable && <Badge variant="amber" className="mr-2">سريعة التلف</Badge>}
                      </p>
                      <p className="text-xs text-ink/50">
                        {entry.operation_type === "load" ? "تحميل" : "تفريغ"} - {entry.wait_reason}
                      </p>
                    </div>
                    <span className="tabular-nums text-sm font-medium text-ink/70">
                      {waitMinutes(entry.arrival_time)} د
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        removeFromQueue.mutate(entry.id, {
                          onSuccess: () => toast.success("تم استدعاء الشاحنة"),
                          onError: (err: Error) => toast.error(err.message),
                        })
                      }
                    >
                      استدعاء
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
