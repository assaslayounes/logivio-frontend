import { useState } from "react";
import toast from "react-hot-toast";
import { useCheckinStatus, useArriveAtGate, useCheckinEntry } from "@/hooks/useQueue";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScanLine, Check, X, LogIn } from "lucide-react";

export function GateCheckinPage() {
  const [qrInput, setQrInput] = useState("");
  const [activeQr, setActiveQr] = useState<string | null>(null);
  const { data: result, isFetching, isError } = useCheckinStatus(activeQr, { poll: false });
  const arrive = useArriveAtGate();
  const entry = useCheckinEntry();

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrInput.trim()) return;
    setActiveQr(qrInput.trim());
  };

  const hasArrived = !!result?.arrival_time;
  const hasEntered = !!result?.entry_time;

  const handleRegisterArrival = () => {
    if (!result) return;
    arrive.mutate(result.checkin_id, {
      onSuccess: (res) => toast.success(res.message),
      onError: (err: Error) => toast.error(err.message),
    });
  };

  const handleAllowEntry = () => {
    if (!result) return;
    entry.mutate(result.checkin_id, {
      onSuccess: (res) => {
        toast.success(res.message);
        setQrInput("");
        setActiveQr(null);
      },
      onError: (err: Error) => toast.error(err.message),
    });
  };

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-1 text-xl font-semibold text-ink">البوابة الرئيسية</h1>
      <p className="mb-6 text-sm text-ink/60">
        امسح رمز QR الخاص بالشاحنة (أو أدخله يدويًا) لتسجيل وصولها أو تأكيد دخولها.
      </p>

      <form onSubmit={handleScan} className="mb-5 flex gap-2">
        <div className="flex-1">
          <Label htmlFor="qr">رمز QR</Label>
          <Input
            id="qr"
            placeholder="مثال: QR-1"
            value={qrInput}
            onChange={(e) => setQrInput(e.target.value)}
          />
        </div>
        <Button type="submit" className="mt-6" disabled={isFetching}>
          <ScanLine size={16} />
          مسح
        </Button>
      </form>

      {isError && activeQr && (
        <Card className="border-danger/30 p-4 text-sm text-danger">لم يُعثر على موعد بهذا الرمز</Card>
      )}

      {result && (
        <Card>
          <CardContent className="p-6">
            <div className="mb-5 flex items-center justify-between">
              <span className="text-base font-medium text-ink">تفاصيل الموعد</span>
              {hasEntered ? (
                <Badge variant="success">دخلت بالفعل</Badge>
              ) : hasArrived ? (
                <Badge variant="brand">وصلت — بانتظار الدخول</Badge>
              ) : (
                <Badge variant="neutral">لم تصل بعد</Badge>
              )}
            </div>

            <div className="mb-5 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-lg font-semibold text-brand">
                ش
              </div>
              <div>
                <p className="text-lg font-medium text-ink">شاحنة {result.plate_number}</p>
                <p className="text-sm text-ink/60">السائق: {result.driver_name}</p>
              </div>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-3">
              <InfoTile label="الموعد" value={new Date(result.scheduled_start).toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" })} />
              <InfoTile label="نوع العملية" value={result.operation_type === "load" ? "تحميل" : "تفريغ"} />
              <InfoTile
                label="نوع البضاعة"
                value={result.is_perishable ? "سريعة التلف" : "عادية"}
                tone={result.is_perishable ? "amber" : undefined}
              />
              <InfoTile label="الرصيف المخصص" value={result.dock_name} />
              {result.gate_name && <InfoTile label="البوابة المخصصة" value={result.gate_name} />}
              {result.queueInfo && (
                <InfoTile
                  label="في الطابور"
                  value={`ترتيب ${result.queueInfo.queue_position} — ${result.queueInfo.resource_name}`}
                  tone="amber"
                />
              )}
            </div>

            <div className="flex flex-col gap-2">
              {hasEntered ? (
                <p className="rounded-md bg-success-soft py-3 text-center text-sm font-medium text-success">
                  تم تسجيل دخول هذه الشاحنة مسبقًا
                </p>
              ) : hasArrived ? (
                <Button size="lg" variant="success" onClick={handleAllowEntry} disabled={entry.isPending}>
                  <Check size={18} />
                  {entry.isPending ? "جارٍ التسجيل..." : "تأكيد الدخول من هذه النافذة"}
                </Button>
              ) : (
                <Button size="lg" onClick={handleRegisterArrival} disabled={arrive.isPending}>
                  <LogIn size={18} />
                  {arrive.isPending ? "جارٍ التوزيع..." : "تسجيل الوصول (توزيع على بوابة)"}
                </Button>
              )}
              <Button size="sm" variant="outline" className="text-danger" onClick={() => toast("سجّل المشكلة عبر لوحة المسؤول لاحقًا")}>
                <X size={15} />
                رفض / مشكلة في الوثائق
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InfoTile({ label, value, tone }: { label: string; value: string; tone?: "amber" }) {
  return (
    <div className={`rounded-md p-3 ${tone === "amber" ? "bg-amber-soft" : "bg-canvas"}`}>
      <p className={`mb-1 text-xs ${tone === "amber" ? "text-amber" : "text-ink/50"}`}>{label}</p>
      <p className={`text-sm font-medium ${tone === "amber" ? "text-amber" : "text-ink"}`}>{value}</p>
    </div>
  );
}
