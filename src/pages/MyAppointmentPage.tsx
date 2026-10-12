import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useCheckinStatus, useArriveAtGate } from "@/hooks/useQueue";
import { getSavedAppointments, removeSavedAppointment, type SavedAppointment } from "@/lib/myAppointments";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export function MyAppointmentPage() {
  const [saved, setSaved] = useState<SavedAppointment[]>([]);

  useEffect(() => {
    setSaved(getSavedAppointments());
  }, []);

  if (!saved.length) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <p className="mb-1 text-base font-medium text-ink">لا توجد مواعيد محفوظة على هذا الهاتف</p>
        <p className="text-sm text-ink/50">احجز موعدًا جديدًا من شاشة "حجز موعد" ليظهر هنا تلقائيًا.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4">
      <h1 className="text-xl font-semibold text-ink">مواعيدي</h1>
      {saved.map((s) => (
        <AppointmentTrackCard
          key={s.qrCode}
          saved={s}
          onDismiss={() => {
            removeSavedAppointment(s.qrCode);
            setSaved(getSavedAppointments());
          }}
        />
      ))}
    </div>
  );
}

function AppointmentTrackCard({ saved, onDismiss }: { saved: SavedAppointment; onDismiss: () => void }) {
  const { data: status, isLoading, isError } = useCheckinStatus(saved.qrCode, { poll: true });
  const arrive = useArriveAtGate();

  if (isLoading) {
    return (
      <Card className="p-5 text-sm text-ink/50">جارٍ التحميل...</Card>
    );
  }

  if (isError || !status) {
    return (
      <Card className="p-5">
        <p className="mb-2 text-sm text-danger">تعذّر العثور على هذا الموعد (قد يكون قديمًا أو مكتملاً)</p>
        <Button size="sm" variant="outline" onClick={onDismiss}>إزالة من القائمة</Button>
      </Card>
    );
  }

  const hasArrived = !!status.arrival_time;
  const hasEntered = !!status.entry_time;
  const hasFinished = !!status.process_end_time;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-base font-medium text-ink">شاحنة {saved.plateNumber}</p>
            <p className="font-mono text-xs text-ink/40">{saved.qrCode}</p>
          </div>
          {status.is_perishable ? <Badge variant="amber">سريعة التلف</Badge> : null}
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
          <InfoRow label="الموعد" value={new Date(status.scheduled_start).toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" })} />
          <InfoRow label="الرصيف" value={status.dock_name} />
        </div>

        {/* رمز QR حقيقي يقرؤه الحارس بالكاميرا مباشرة */}
        {!hasFinished && (
          <div className="mb-4 flex flex-col items-center rounded-md border border-border bg-white p-4">
            <QRCodeSVG value={saved.qrCode} size={176} level="M" marginSize={2} />
            <p className="mt-3 text-xs text-ink/50">أظهر هذا الرمز للحارس عند البوابة</p>
          </div>
        )}

        {/* شريط الحالة الحية */}
        <div className="mb-4 rounded-md bg-canvas p-3">
          {hasFinished ? (
            <StatusLine tone="success" text="اكتملت العملية — يمكنك المغادرة" />
          ) : hasEntered ? (
            <StatusLine tone="success" text={`دخلت المصنع — توجّه إلى ${status.dock_name}`} />
          ) : hasArrived && status.queueInfo ? (
            <StatusLine
              tone="amber"
              text={
                status.queueInfo.queue_type === "gate"
                  ? `بانتظار توفر ${status.queueInfo.resource_name} — ترتيبك: ${status.queueInfo.queue_position}`
                  : `بانتظار تحرر ${status.queueInfo.resource_name} — ترتيبك: ${status.queueInfo.queue_position}`
              }
            />
          ) : hasArrived && status.gate_name ? (
            <StatusLine tone="brand" text={`توجّه إلى ${status.gate_name} لمسح الرمز والدخول`} />
          ) : (
            <StatusLine tone="neutral" text="لم تسجّل وصولك بعد" />
          )}
        </div>

        {!hasArrived && (
          <Button
            className="w-full"
            size="lg"
            onClick={() =>
              arrive.mutate(status.checkin_id, {
                onSuccess: (res) => toast.success(res.message),
                onError: (err: Error) => toast.error(err.message),
              })
            }
            disabled={arrive.isPending}
          >
            <MapPin size={16} />
            {arrive.isPending ? "جارٍ التسجيل..." : "لقد وصلت"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-ink/50">{label}</p>
      <p className="font-medium text-ink">{value}</p>
    </div>
  );
}

function StatusLine({ tone, text }: { tone: "success" | "amber" | "brand" | "neutral"; text: string }) {
  const dotColor = { success: "bg-success", amber: "bg-amber", brand: "bg-brand", neutral: "bg-ink/30" }[tone];
  const textColor = { success: "text-success", amber: "text-amber", brand: "text-brand", neutral: "text-ink/60" }[tone];
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2 w-2 shrink-0 rounded-full ${dotColor}`} />
      <span className={`text-sm font-medium ${textColor}`}>{text}</span>
    </div>
  );
}
