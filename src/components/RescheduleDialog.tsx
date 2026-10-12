import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { X, CloudRain, ZapOff, Wrench, HelpCircle } from "lucide-react";
import { useRescheduleAppointment } from "@/hooks/useAppointments";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import type { Appointment, Dock, RescheduleReason } from "@/types";

const reasons: { value: RescheduleReason; label: string; icon: typeof CloudRain }[] = [
  { value: "weather", label: "سوء الأحوال الجوية", icon: CloudRain },
  { value: "power_outage", label: "انقطاع الكهرباء", icon: ZapOff },
  { value: "dock_maintenance", label: "صيانة طارئة", icon: Wrench },
  { value: "other", label: "سبب آخر", icon: HelpCircle },
];

const schema = z.object({
  date: z.string().min(1, "التاريخ مطلوب"),
  time: z.string().min(1, "الوقت مطلوب"),
  dockId: z.coerce.number().positive(),
  reasonCategory: z.enum(["weather", "power_outage", "dock_maintenance", "other"]),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

// تنسيق محلي YYYY-MM-DD و HH:mm دون انزياح المنطقة الزمنية
const pad = (n: number) => String(n).padStart(2, "0");
const toDateInput = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const toTimeInput = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

interface Props {
  appointment: Appointment;
  docks: Dock[];
  onClose: () => void;
}

export function RescheduleDialog({ appointment, docks, onClose }: Props) {
  const reschedule = useRescheduleAppointment();
  const currentStart = new Date(appointment.scheduled_start);
  const durationMs = new Date(appointment.scheduled_end).getTime() - currentStart.getTime();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: toDateInput(currentStart),
      time: toTimeInput(currentStart),
      dockId: appointment.dock_id,
      reasonCategory: "weather",
      notes: "",
    },
  });

  const selectedReason = watch("reasonCategory");

  const onSubmit = (values: FormValues) => {
    // المدة الأصلية للموعد تُحفظ كما هي، فقط يتغير وقت البداية
    const start = new Date(`${values.date}T${values.time}:00`);
    const end = new Date(start.getTime() + durationMs);
    reschedule.mutate(
      {
        id: appointment.id,
        scheduledStart: start.toISOString(),
        scheduledEnd: end.toISOString(),
        dockId: values.dockId,
        reasonCategory: values.reasonCategory,
        notes: values.notes || undefined,
      },
      {
        onSuccess: () => {
          toast.success("تمت إعادة جدولة الموعد بنجاح");
          onClose();
        },
        onError: (err: Error) => toast.error(err.message),
      }
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-lg bg-surface p-5 sm:max-w-md sm:rounded-lg"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-base font-semibold text-ink">إعادة جدولة موعد</p>
            <p className="text-xs text-ink/50">
              شاحنة {appointment.plate_number} — {appointment.dock_name}
            </p>
          </div>
          <button onClick={onClose} aria-label="إغلاق">
            <X size={18} className="text-ink/40" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <Label>سبب إعادة الجدولة</Label>
            <div className="grid grid-cols-2 gap-2">
              {reasons.map(({ value, label, icon: Icon }) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setValue("reasonCategory", value)}
                  className={`flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium transition-colors ${
                    selectedReason === value
                      ? "border-amber bg-amber-soft text-amber"
                      : "border-border bg-surface text-ink/60"
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="rs-date">التاريخ الجديد</Label>
              <Input id="rs-date" type="date" {...register("date")} />
              {errors.date && <p className="mt-1 text-xs text-danger">{errors.date.message}</p>}
            </div>
            <div>
              <Label htmlFor="rs-time">الوقت الجديد</Label>
              <Input id="rs-time" type="time" {...register("time")} />
              {errors.time && <p className="mt-1 text-xs text-danger">{errors.time.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="rs-dock">الرصيف</Label>
            <Select id="rs-dock" {...register("dockId")}>
              {docks.map((d) => (
                <option key={d.id} value={d.id} disabled={d.status === "maintenance"}>
                  {d.name} {d.status === "maintenance" ? "(صيانة)" : ""}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="rs-notes">ملاحظات (اختياري)</Label>
            <Input id="rs-notes" placeholder="مثال: انقطاع عام في المنطقة الصناعية" {...register("notes")} />
          </div>

          <p className="rounded-md bg-canvas p-3 text-xs leading-5 text-ink/60">
            يتحقق النظام تلقائيًا من أن الموعد الجديد ضمن ساعات العمل ولا يتعارض مع حجز آخر على نفس الرصيف.
          </p>

          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              إلغاء
            </Button>
            <Button type="submit" className="flex-1" disabled={reschedule.isPending}>
              {reschedule.isPending ? "جارٍ الحفظ..." : "تأكيد إعادة الجدولة"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
