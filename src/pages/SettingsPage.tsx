import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useFacility, useUpdateFacility } from "@/hooks/useFacility";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Navigate } from "react-router-dom";

const schema = z.object({
  name: z.string().min(2, "اسم المصنع مطلوب"),
  ownerName: z.string().optional(),
  ownerPhone: z.string().optional(),
  address: z.string().optional(),
  workingHoursStart: z.string().min(1),
  workingHoursEnd: z.string().min(1),
  maxTrucksPerDay: z.coerce.number().min(0),
});
type FormValues = z.infer<typeof schema>;

export function SettingsPage() {
  const { user } = useAuth();
  const facilityId = user?.facilityId ?? 1;
  const { data: facility, isLoading } = useFacility(facilityId);
  const updateFacility = useUpdateFacility(facilityId);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (facility) {
      reset({
        name: facility.name,
        ownerName: facility.owner_name ?? "",
        ownerPhone: facility.owner_phone ?? "",
        address: facility.address ?? "",
        workingHoursStart: facility.working_hours_start?.slice(0, 5),
        workingHoursEnd: facility.working_hours_end?.slice(0, 5),
        maxTrucksPerDay: facility.max_trucks_per_day,
      });
    }
  }, [facility, reset]);

  if (user && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  const onSubmit = (values: FormValues) => {
    updateFacility.mutate(values, {
      onSuccess: () => toast.success("تم حفظ إعدادات المصنع"),
      onError: (err: Error) => toast.error(err.message),
    });
  };

  if (isLoading) return <p className="text-sm text-ink/50">جارٍ التحميل...</p>;

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-1 text-xl font-semibold text-ink">إعدادات المصنع</h1>
      <p className="mb-6 text-sm text-ink/60">هذه البيانات تُستخدم في المواعيد والتقارير وواجهة الحجز.</p>

      <Card>
        <CardHeader>
          <CardTitle>بيانات المصنع</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div>
              <Label htmlFor="name">اسم المصنع</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="mt-1 text-xs text-danger">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="ownerName">اسم صاحب المصنع</Label>
                <Input id="ownerName" placeholder="مثال: عمر بن عمر" {...register("ownerName")} />
              </div>
              <div>
                <Label htmlFor="ownerPhone">هاتف صاحب المصنع</Label>
                <Input id="ownerPhone" placeholder="0555 00 00 00" {...register("ownerPhone")} />
              </div>
            </div>

            <div>
              <Label htmlFor="address">العنوان</Label>
              <Input id="address" placeholder="مثال: المنطقة الصناعية، قالمة" {...register("address")} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="workingHoursStart">بداية ساعات العمل</Label>
                <Input id="workingHoursStart" type="time" {...register("workingHoursStart")} />
              </div>
              <div>
                <Label htmlFor="workingHoursEnd">نهاية ساعات العمل</Label>
                <Input id="workingHoursEnd" type="time" {...register("workingHoursEnd")} />
              </div>
            </div>

            <div>
              <Label htmlFor="maxTrucksPerDay">أقصى عدد شاحنات يوميًا</Label>
              <Input id="maxTrucksPerDay" type="number" {...register("maxTrucksPerDay")} />
            </div>

            <Button type="submit" size="lg" disabled={isSubmitting || updateFacility.isPending}>
              {updateFacility.isPending ? "جارٍ الحفظ..." : "حفظ الإعدادات"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
