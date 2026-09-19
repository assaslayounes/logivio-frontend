import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth, type UserRole } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { roleHomePath, roleLabels } from "@/lib/roleHomePath";
import { Truck, ScanLine, Warehouse, LayoutDashboard } from "lucide-react";

const roleOptions: { value: UserRole; icon: typeof Truck }[] = [
  { value: "driver", icon: Truck },
  { value: "gate_agent", icon: ScanLine },
  { value: "dock_operator", icon: Warehouse },
  { value: "admin", icon: LayoutDashboard },
];

const schema = z.object({
  fullName: z.string().min(2, "الاسم الكامل مطلوب"),
  email: z.string().email("بريد إلكتروني غير صالح"),
  password: z.string().min(6, "6 أحرف على الأقل"),
  role: z.enum(["driver", "gate_agent", "dock_operator", "admin"]),
});
type FormValues = z.infer<typeof schema>;

export function RegisterPage() {
  const { register: registerUser } = useAuth();
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
        <img src="/logo.svg" alt="Logivio" className="mx-auto mb-3 h-14 w-14" />
        <p className="text-xl font-bold text-brand">إنشاء حساب جديد</p>
        <p className="mt-1 text-sm text-ink/50">اختر دورك وأنشئ حسابك للبدء</p>
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
                  <div className="grid grid-cols-2 gap-2">
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
        <Link to="/login" className="font-medium text-brand hover:underline">
          تسجيل الدخول
        </Link>
      </p>
    </div>
  );
}
