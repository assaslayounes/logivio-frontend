import { useState } from "react";
import toast from "react-hot-toast";
import { useCheckinStatus, useStartOperation, useFinishOperation, useLogDelayReason } from "@/hooks/useQueue";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, CheckCircle2, ScanLine } from "lucide-react";

const delayReasons = [
  { value: "late_truck", label: "تأخر الشاحنة" },
  { value: "dock_unavailable", label: "عدم توفر الرصيف" },
  { value: "previous_truck_delay", label: "تأخر الشاحنة السابقة" },
  { value: "document_issue", label: "مشكلة في الوثائق" },
  { value: "loading_issue", label: "مشكلة في التحميل" },
  { value: "unloading_issue", label: "مشكلة في التفريغ" },
  { value: "warehouse_issue", label: "مشكلة في المخزن" },
  { value: "production_issue", label: "مشكلة في الإنتاج" },
  { value: "technical_issue", label: "مشكلة تقنية" },
];

export function DockOperationsPage() {
  const [qrInput, setQrInput] = useState("");
  const [activeQr, setActiveQr] = useState<string | null>(null);
  const [showDelayForm, setShowDelayForm] = useState(false);
  const [reasonCategory, setReasonCategory] = useState(delayReasons[0].value);
  const [delayMinutes, setDelayMinutes] = useState(10);

  const { data: result, isError } = useCheckinStatus(activeQr, { poll: true });
  const startOp = useStartOperation();
  const finishOp = useFinishOperation();
  const logDelay = useLogDelayReason();

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrInput.trim()) return;
    setActiveQr(qrInput.trim());
    setShowDelayForm(false);
  };

  const hasStarted = !!result?.process_start_time;
  const hasFinished = !!result?.process_end_time;
  const isLate = result ? new Date() > new Date(new Date(result.scheduled_start).getTime() + 15 * 60000) && !hasStarted : false;

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-1 text-xl font-semibold text-ink">عمليات الرصيف</h1>
      <p className="mb-6 text-sm text-ink/60">امسح رمز الشاحنة الموجودة عند الرصيف لبدء العملية أو إنهائها.</p>

      <form onSubmit={handleScan} className="mb-5 flex gap-2">
        <div className="flex-1">
          <Label htmlFor="qr">رمز QR</Label>
          <Input id="qr" placeholder="مثال: QR-1" value={qrInput} onChange={(e) => setQrInput(e.target.value)} />
        </div>
        <Button type="submit" className="mt-6">
          <ScanLine size={16} />
          بحث
        </Button>
      </form>

      {isError && activeQr && <Card className="border-danger/30 p-4 text-sm text-danger">لم يُعثر على موعد بهذا الرمز</Card>}

      {result && (
        <Card>
          <CardContent className="p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-lg font-medium text-ink">شاحنة {result.plate_number}</p>
                <p className="text-sm text-ink/60">{result.dock_name} — {result.operation_type === "load" ? "تحميل" : "تفريغ"}</p>
              </div>
              {isLate && <Badge variant="danger">متأخرة عن موعدها</Badge>}
              {hasFinished && <Badge variant="success">مكتملة</Badge>}
              {hasStarted && !hasFinished && <Badge variant="brand">قيد التنفيذ</Badge>}
            </div>

            {!hasStarted && (
              <Button
                size="lg"
                className="w-full"
                onClick={() =>
                  startOp.mutate(result.checkin_id, {
                    onSuccess: () => toast.success("بدأت العملية"),
                    onError: (err: Error) => toast.error(err.message),
                  })
                }
                disabled={startOp.isPending}
              >
                <PlayCircle size={18} />
                بدء العملية
              </Button>
            )}

            {hasStarted && !hasFinished && !showDelayForm && (
              <Button size="lg" variant="success" className="w-full" onClick={() => (isLate ? setShowDelayForm(true) : handleFinish())}>
                <CheckCircle2 size={18} />
                إنهاء العملية
              </Button>
            )}

            {showDelayForm && (
              <div className="flex flex-col gap-3 rounded-md bg-amber-soft p-4">
                <p className="text-sm font-medium text-amber">هذه الشاحنة تأخرت — يُرجى تسجيل السبب قبل الإنهاء</p>
                <div>
                  <Label>سبب التأخير</Label>
                  <Select value={reasonCategory} onChange={(e) => setReasonCategory(e.target.value)}>
                    {delayReasons.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>مدة التأخير (دقائق)</Label>
                  <Input type="number" value={delayMinutes} onChange={(e) => setDelayMinutes(Number(e.target.value))} />
                </div>
                <Button
                  onClick={async () => {
                    await logDelay.mutateAsync({ checkinId: result.checkin_id, reasonCategory, delayMinutes });
                    handleFinish();
                  }}
                >
                  تسجيل السبب وإنهاء العملية
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );

  function handleFinish() {
    if (!result) return;
    finishOp.mutate(result.checkin_id, {
      onSuccess: () => {
        toast.success("اكتملت العملية وتحرر الرصيف");
        setShowDelayForm(false);
        setActiveQr(null);
        setQrInput("");
      },
      onError: (err: Error) => toast.error(err.message),
    });
  }
}
