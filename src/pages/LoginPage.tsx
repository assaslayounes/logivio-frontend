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

const schema = z.object({
  email: z.string().email("بريد إلكتروني غير صالح"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});
type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const user = await login(values.email, values.password);
      toast.success(`أهلاً بك، ${user.fullName}`);
      navigate(roleHomePath(user.role));
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-sm flex-col justify-center">
      <div className="mb-8 text-center">
        <div className="mb-3 flex justify-center">
          <LogoMark size={56} />
        </div>
        <p className="text-xl font-bold text-brand">تسجيل الدخول</p>
        <p className="mt-1 text-sm text-ink/50">أدخل بياناتك للمتابعة إلى حسابك</p>
      </div>
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div>
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
              {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="password">كلمة المرور</Label>
              <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
              {errors.password && <p className="mt-1 text-xs text-danger">{errors.password.message}</p>}
            </div>
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? "جارٍ الدخول..." : "دخول"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <p className="mt-5 text-center text-sm text-ink/60">
        ليس لديك حساب؟{" "}
        <Link to="/register" className="font-medium text-brand hover:underline">
          إنشاء حساب جديد
        </Link>
      </p>
    </div>
  );
}
