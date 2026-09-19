import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useDocks } from "@/hooks/useDocks";
import { useCreateAppointment } from "@/hooks/useAppointments";
import { saveAppointment } from "@/lib/myAppointments";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";

const bookingSchema = z.object({
  dockId: z.coerce.number({ invalid_type_error: "اختر رصيفًا" }).positive("اختر رصيفًا"),
  plateNumber: z.string().min(2, "رقم اللوحة مطلوب"),
  driverName: z.string().min(2, "اسم السائق مطلوب"),
  operationType: z.enum(["load", "unload"]),
  isPerishable: z.boolean(),
  date: z.string().min(1, "التاريخ مطلوب"),
  time: z.string().min(1, "الوقت مطلوب"),
});

type BookingForm = z.infer<typeof bookingSchema>;

export function BookingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const facilityId = user?.facilityId ?? 1;
  const { data: docks, isLoading: docksLoading } = useDocks(facilityId);
  const createAppointment = useCreateAppointment();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      operationType: "unload",
      isPerishable: false,
      date: new Date().toISOString().slice(0, 10),
      time: "10:00",
    },
  });

  const onSubmit = (values: BookingForm) => {
    const scheduledStart = new Date(`${values.date}T${values.time}:00`);
    const dock = docks?.find((d) => d.id === values.dockId);
    const durationMinutes = dock?.avg_process_minutes ?? 60;
    const scheduledEnd = new Date(scheduledStart.getTime() + durationMinutes * 60000);

    createAppointment.mutate(
      {
        facilityId,
        dockId: values.dockId,
        plateNumber: values.plateNumber,
        driverName: values.driverName,
        operationType: values.operationType,
        isPerishable: values.isPerishable,
        scheduledStart: scheduledStart.toISOString(),
        scheduledEnd: scheduledEnd.toISOString(),
      },
      {
        onSuccess: (data) => {
          saveAppointment({
            qrCode: data.qrCode,
            plateNumber: values.plateNumber,
            createdAt: new Date().toISOString(),
          });
          toast.success("تم تأكيد الحجز بنجاح");
          reset();
          navigate("/my-appointment");
        },
        onError: (err: Error) => toast.error(err.message),
      }
    );
  };

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-1 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-ink">حجز موعد جديد</h1>
        <button onClick={() => navigate("/my-appointment")} className="text-xs font-medium text-brand hover:underline">
          مواعيدي ←
        </button>
      </div>
      <p className="mb-6 text-sm text-ink/60">
        النظام يمنع تلقائيًا أي حجز يتعارض مع رصيف مشغول أو يقع خارج ساعات العمل.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>بيانات الموعد</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div>
              <Label htmlFor="plateNumber">رقم لوحة الشاحنة</Label>
              <Input id="plateNumber" placeholder="مثال: 4471-GL" {...register("plateNumber")} />
              {errors.plateNumber && <p className="mt-1 text-xs text-danger">{errors.plateNumber.message}</p>}
            </div>

            <div>
              <Label htmlFor="driverName">اسم السائق</Label>
              <Input id="driverName" placeholder="مثال: كريم بلحاج" {...register("driverName")} />
              {errors.driverName && <p className="mt-1 text-xs text-danger">{errors.driverName.message}</p>}
            </div>

            <div>
              <Label htmlFor="dockId">الرصيف</Label>
              <Select id="dockId" disabled={docksLoading} {...register("dockId")}>
                <option value="">اختر رصيفًا</option>
                {docks?.map((dock) => (
                  <option key={dock.id} value={dock.id} disabled={dock.status === "maintenance"}>
                    {dock.name} {dock.status === "maintenance" ? "(متوقف للصيانة)" : ""}
                  </option>
                ))}
              </Select>
              {errors.dockId && <p className="mt-1 text-xs text-danger">{errors.dockId.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="date">التاريخ</Label>
                <Input id="date" type="date" {...register("date")} />
              </div>
              <div>
                <Label htmlFor="time">الوقت</Label>
                <Input id="time" type="time" {...register("time")} />
              </div>
            </div>

            <div>
              <Label>نوع العملية</Label>
              <Controller
                control={control}
                name="operationType"
                render={({ field }) => (
                  <div className="flex gap-2">
                    {(["unload", "load"] as const).map((val) => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => field.onChange(val)}
                        className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                          field.value === val
                            ? "border-brand bg-brand-soft text-brand"
                            : "border-border bg-surface text-ink/60"
                        }`}
                      >
                        {val === "unload" ? "تفريغ" : "تحميل"}
                      </button>
                    ))}
                  </div>
                )}
              />
            </div>

            <Controller
              control={control}
              name="isPerishable"
              render={({ field }) => (
                <label className="flex cursor-pointer items-center justify-between rounded-md bg-amber-soft px-3 py-2.5">
                  <span className="text-sm font-medium text-amber">مادة سريعة التلف - أولوية</span>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="h-4 w-4 accent-amber"
                  />
                </label>
              )}
            />

            <Button type="submit" size="lg" disabled={createAppointment.isPending}>
              {createAppointment.isPending ? "جارٍ التأكيد..." : "تأكيد الحجز"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
