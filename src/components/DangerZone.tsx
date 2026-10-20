import { useState } from "react";
import toast from "react-hot-toast";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { useResetDemoData } from "@/hooks/useFacility";
import { clearSavedAppointments } from "@/lib/myAppointments";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/** منطقة الخطر: حذف البيانات التجريبية للمصنع (للعروض والتجارب) */
export function DangerZone() {
  const [open, setOpen] = useState(false);
  const reset = useResetDemoData();

  const handleConfirm = () => {
    reset.mutate(undefined, {
      onSuccess: (r) => {
        clearSavedAppointments(); // مواعيد السائق المحفوظة على هذا المتصفح لم تعد موجودة
        setOpen(false);
        toast.success(
          r.deletedAppointments === 0
            ? "لا توجد بيانات تجريبية لحذفها"
            : `تم حذف ${r.deletedAppointments} موعدًا و${r.deletedCheckins} تسجيلًا و${r.deletedQueueEntries} من الطوابير`
        );
      },
      onError: (err: Error) => toast.error(err.message),
    });
  };

  return (
    <>
      <Card className="mt-6 border-danger/40">
        <CardContent className="p-5">
          <div className="mb-3 flex items-center gap-2 text-danger">
            <AlertTriangle size={18} />
            <p className="text-sm font-semibold">منطقة الخطر — حذف البيانات التجريبية</p>
          </div>
          <p className="mb-3 text-xs leading-5 text-ink/60">
            يفرّغ هذا الزر مصنعك من بيانات التشغيل ليبدأ عرض جديد من الصفر. لا يمكن التراجع عنه.
          </p>
          <div className="mb-4 grid gap-3 text-xs sm:grid-cols-2">
            <div className="rounded-md bg-danger-soft p-3">
              <p className="mb-1 font-semibold text-danger">يُحذف</p>
              <ul className="list-inside list-disc leading-5 text-ink/70">
                <li>كل المواعيد ورموز QR الخاصة بها</li>
                <li>تسجيلات البوابة وأسباب التأخير</li>
                <li>الطوابير الحالية</li>
                <li>الشاحنات التي لا تتبع إلا لمواعيد مصنعك</li>
              </ul>
            </div>
            <div className="rounded-md bg-success-soft p-3">
              <p className="mb-1 font-semibold text-success">يبقى</p>
              <ul className="list-inside list-disc leading-5 text-ink/70">
                <li>الحسابات (مسؤول، سائقون، حراس)</li>
                <li>بيانات المصنع وساعات العمل</li>
                <li>الأرصفة والبوابات (المشغولة تعود «متاحة»)</li>
              </ul>
            </div>
          </div>
          <Button variant="danger" onClick={() => setOpen(true)}>
            <Trash2 size={15} />
            حذف البيانات التجريبية
          </Button>
        </CardContent>
      </Card>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
          onClick={() => !reset.isPending && setOpen(false)}
        >
          <div
            className="w-full rounded-t-lg bg-surface p-5 sm:max-w-sm sm:rounded-lg"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="mb-3 flex items-start justify-between">
              <p className="text-base font-semibold text-ink">هل أنت متأكد؟</p>
              <button onClick={() => setOpen(false)} disabled={reset.isPending} aria-label="إغلاق">
                <X size={18} className="text-ink/40" />
              </button>
            </div>
            <p className="mb-5 text-sm leading-6 text-ink/70">
              سيُحذف كل المواعيد وتسجيلات البوابة والطوابير في مصنعك نهائيًا، ولن تعمل رموز QR المصدَّرة سابقًا.
              الحسابات والأرصفة والبوابات والإعدادات لن تُمَسّ.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setOpen(false)} disabled={reset.isPending}>
                إلغاء
              </Button>
              <Button variant="danger" className="flex-1" onClick={handleConfirm} disabled={reset.isPending}>
                {reset.isPending ? "جارٍ الحذف..." : "نعم، احذف"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
