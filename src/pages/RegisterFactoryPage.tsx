import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { roleHomePath } from "@/lib/roleHomePath";
import { LogoMark } from "@/components/Logo";
import { Factory } from "lucide-react";

const schema = z.object({
  facilityName: z.string().min(2, "اسم المصنع مطلوب"),
  fullName: z.string().min(2, "اسمك الكامل مطلوب"),
  email: z.string().email("بريد إلكتروني غير صالح"),
  password: z.string().min(6, "6 أحرف على الأقل"),
});
type FormValues = z.infer<typeof schema>;

export function RegisterFactoryPage() {
  const { registerFactory } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const user = await registerFactory(values);
      toast.success("تم إنشاء مصنعك بنجاح — يمكنك الآن إعداد باقي البيانات من الإعدادات");
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
        <p className="text-xl font-bold text-brand">تسجيل مصنع جديد</p>
        <p className="mt-1 text-sm text-ink/50">
          أنشئ حساب مصنعك الخاص وابدأ بإدارة تدفق شاحناتك فورًا
        </p>
      </div>
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div>
              <Label htmlFor="facilityName">اسم المصنع</Label>
              <Input id="facilityName" placeholder="مثال: مصنع عمر بن عمر - قالمة" {...register("facilityName")} />
              {errors.facilityName && <p className="mt-1 text-xs text-danger">{errors.facilityName.message}</p>}
            </div>

            <div>
              <Label htmlFor="fullName">اسمك الكامل (صاحب الحساب)</Label>
              <Input id="fullName" placeholder="مثال: عمر بن عمر" {...register("fullName")} />
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
              <Factory size={16} />
              {isSubmitting ? "جارٍ الإنشاء..." : "إنشاء حساب المصنع"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <p className="mt-5 text-center text-sm text-ink/60">
        أنت موظف في مصنع مسجَّل بالفعل؟{" "}
        <Link to="/register" className="font-medium text-brand hover:underline">سجّل كموظف</Link>
      </p>
      <p className="mt-2 text-center text-xs text-ink/40">
        لديك حساب بالفعل؟{" "}
        <Link to="/login" className="font-medium text-brand hover:underline">تسجيل الدخول</Link>
      </p>
    </div>
  );
}
