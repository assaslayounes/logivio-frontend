import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth, type OperationalRole } from "@/context/AuthContext";
import { useFacilitiesList } from "@/hooks/useFacility";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { roleHomePath, roleLabels } from "@/lib/roleHomePath";
import { LogoMark } from "@/components/Logo";
import { Truck, ScanLine, Warehouse } from "lucide-react";

const roleOptions: { value: OperationalRole; icon: typeof Truck }[] = [
  { value: "driver", icon: Truck },
  { value: "gate_agent", icon: ScanLine },
  { value: "dock_operator", icon: Warehouse },
];

const schema = z.object({
  fullName: z.string().min(2, "الاسم الكامل مطلوب"),
  email: z.string().email("بريد إلكتروني غير صالح"),
  password: z.string().min(6, "6 أحرف على الأقل"),
  role: z.enum(["driver", "gate_agent", "dock_operator"]),
  facilityId: z.coerce.number({ invalid_type_error: "اختر مصنعك" }).positive("اختر مصنعك"),
});
type FormValues = z.infer<typeof schema>;

export function RegisterPage() {
  const { register: registerUser } = useAuth();
  const { data: facilities, isLoading: facilitiesLoading } = useFacilitiesList();
  const navigate = useNavigate();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: "driver" },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const user = await registerUser(values);
      toast.success("تم إنشاء حسابك بنجاح");
      navigate(roleHomePath(user.role));
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-sm flex-col justify-center py-8">
      <div className="mb-6 text-center">
        <div className="mb-3 flex justify-center">
          <LogoMark size={56} />
        </div>
        <p className="text-xl font-bold text-brand">إنشاء حساب موظف</p>
        <p className="mt-1 text-sm text-ink/50">انضم إلى مصنع قائم بالفعل على المنصة</p>
      </div>
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div>
              <Label>أنا</Label>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <div className="grid grid-cols-3 gap-2">
                    {roleOptions.map(({ value, icon: Icon }) => (
                      <button
                        type="button"
                        key={value}
                        onClick={() => field.onChange(value)}
                        className={`flex flex-col items-center gap-1.5 rounded-md border p-3 text-xs font-medium transition-colors ${
                          field.value === value
                            ? "border-brand bg-brand-soft text-brand"
                            : "border-border bg-surface text-ink/60"
                        }`}
                      >
                        <Icon size={18} />
                        {roleLabels[value]}
                      </button>
                    ))}
                  </div>
                )}
              />
            </div>

            <div>
              <Label htmlFor="facilityId">المصنع</Label>
              <Select id="facilityId" disabled={facilitiesLoading} {...register("facilityId")}>
                <option value="">اختر مصنعك</option>
                {facilities?.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </Select>
              {errors.facilityId && <p className="mt-1 text-xs text-danger">{errors.facilityId.message}</p>}
            </div>

            <div>
              <Label htmlFor="fullName">الاسم الكامل</Label>
              <Input id="fullName" placeholder="مثال: كريم بلحاج" {...register("fullName")} />
              {errors.fullName && <p className="mt-1 text-xs text-danger">{errors.fullName.message}</p>}
            </div>

            <div>
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
              {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
            </div>

            <div>
              <Label htmlFor="password">كلمة المرور</Label>
              <Input id="password" type="password" placeholder="6 أحرف على الأقل" {...register("password")} />
              {errors.password && <p className="mt-1 text-xs text-danger">{errors.password.message}</p>}
            </div>

            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? "جارٍ الإنشاء..." : "إنشاء الحساب"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <p className="mt-5 text-center text-sm text-ink/60">
        لديك حساب بالفعل؟{" "}
        <Link to="/login" className="font-medium text-brand hover:underline">تسجيل الدخول</Link>
      </p>
      <p className="mt-2 text-center text-xs text-ink/40">
        أنت صاحب مصنع ولم تُسجَّله بعد؟{" "}
        <Link to="/register-factory" className="font-medium text-brand hover:underline">سجّل مصنعك الآن</Link>
      </p>
    </div>
  );
}
