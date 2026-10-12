import { useState } from "react";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import { useDocks, useCreateDock } from "@/hooks/useDocks";
import { useGates, useCreateGate } from "@/hooks/useGates";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const statusLabel: Record<string, string> = {
  available: "متاح",
  busy: "مشغول",
  maintenance: "صيانة",
};

/** إدارة الأرصفة والبوابات: عرض القائمة الحالية + إضافة جديد (للمسؤول فقط) */
export function ResourceManager({ facilityId }: { facilityId: number }) {
  const { data: docks } = useDocks(facilityId);
  const { data: gates } = useGates(facilityId);
  const createDock = useCreateDock();
  const createGate = useCreateGate();

  const [dockName, setDockName] = useState("");
  const [dockMinutes, setDockMinutes] = useState(60);
  const [gateName, setGateName] = useState("");
  const [gateMinutes, setGateMinutes] = useState(5);

  const addDock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dockName.trim()) return;
    createDock.mutate(
      { name: dockName, avgProcessMinutes: dockMinutes },
      {
        onSuccess: () => {
          toast.success("تمت إضافة الرصيف");
          setDockName("");
        },
        onError: (err: Error) => toast.error(err.message),
      }
    );
  };

  const addGate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gateName.trim()) return;
    createGate.mutate(
      { name: gateName, avgCheckinMinutes: gateMinutes },
      {
        onSuccess: () => {
          toast.success("تمت إضافة البوابة");
          setGateName("");
        },
        onError: (err: Error) => toast.error(err.message),
      }
    );
  };

  return (
    <div className="mt-6 grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>الأرصفة ({docks?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="mb-4 flex flex-col gap-1.5">
            {docks?.map((d) => (
              <li key={d.id} className="flex items-center justify-between rounded-md bg-canvas px-3 py-2 text-sm">
                <span>
                  {d.name} <span className="text-xs text-ink/40">· {d.avg_process_minutes} د</span>
                </span>
                <Badge variant={d.status === "available" ? "success" : d.status === "busy" ? "danger" : "amber"}>
                  {statusLabel[d.status]}
                </Badge>
              </li>
            ))}
          </ul>
          <form onSubmit={addDock} className="flex flex-col gap-3 border-t border-border pt-4">
            <div>
              <Label htmlFor="dock-name">اسم الرصيف الجديد</Label>
              <Input id="dock-name" placeholder="مثال: رصيف 2" value={dockName} onChange={(e) => setDockName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="dock-min">مدة معالجة الشاحنة (دقائق)</Label>
              <Input id="dock-min" type="number" min={5} value={dockMinutes} onChange={(e) => setDockMinutes(Number(e.target.value))} />
            </div>
            <Button type="submit" variant="outline" disabled={createDock.isPending}>
              <Plus size={15} />
              إضافة رصيف
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>البوابات ({gates?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="mb-4 flex flex-col gap-1.5">
            {gates?.map((g) => (
              <li key={g.id} className="flex items-center justify-between rounded-md bg-canvas px-3 py-2 text-sm">
                <span>
                  {g.name} <span className="text-xs text-ink/40">· {g.avg_checkin_minutes} د</span>
                </span>
                <Badge variant={g.status === "available" ? "success" : g.status === "busy" ? "danger" : "amber"}>
                  {statusLabel[g.status]}
                </Badge>
              </li>
            ))}
          </ul>
          <form onSubmit={addGate} className="flex flex-col gap-3 border-t border-border pt-4">
            <div>
              <Label htmlFor="gate-name">اسم البوابة الجديدة</Label>
              <Input id="gate-name" placeholder="مثال: البوابة 2" value={gateName} onChange={(e) => setGateName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="gate-min">مدة المعالجة عند البوابة (دقائق)</Label>
              <Input id="gate-min" type="number" min={1} value={gateMinutes} onChange={(e) => setGateMinutes(Number(e.target.value))} />
            </div>
            <Button type="submit" variant="outline" disabled={createGate.isPending}>
              <Plus size={15} />
              إضافة بوابة
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
