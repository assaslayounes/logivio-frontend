import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { roleLabels } from "@/lib/roleHomePath";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Truck, ScanLine, LayoutDashboard, Warehouse, CalendarClock,
  ListOrdered, Settings, Clock, MapPin, BarChart3,
} from "lucide-react";

const features = [
  {
    icon: CalendarClock,
    title: "حجز مواعيد ذكي",
    desc: "يمنع النظام تلقائيًا أي حجز يتعارض مع رصيف مشغول أو يقع خارج ساعات العمل.",
  },
  {
    icon: MapPin,
    title: "توزيع تلقائي على البوابات",
    desc: "كل شاحنة تُوجَّه لحظيًا إلى أقل بوابة ازدحامًا، بدل الانتظار العشوائي عند المدخل.",
  },
  {
    icon: ListOrdered,
    title: "طوابير منفصلة لكل مورد",
    desc: "طابور خاص بكل بوابة ورصيف على حدة، مع أولوية تلقائية للمواد سريعة التلف.",
  },
  {
    icon: BarChart3,
    title: "مؤشرات تشغيلية حية",
    desc: "متوسط الانتظار، نسبة الالتزام بالمواعيد، واستغلال الأرصفة — محدَّثة لحظيًا.",
  },
];

const pricingTiers = [
  {
    name: "أساسية",
    docksRange: "1 إلى 4 أرصفة",
    desc: "إدارة المواعيد والطابور والتسجيل عبر QR — مناسبة للمواقع الصغيرة.",
    highlight: false,
  },
  {
    name: "احترافية",
    docksRange: "5 إلى 12 رصيفًا",
    desc: "كل ميزات الباقة الأساسية، مع الإشعارات وإعادة الجدولة الديناميكية وتقارير أعمق.",
    highlight: true,
  },
  {
    name: "مؤسسية",
    docksRange: "أكثر من 12 رصيفًا",
    desc: "تعدد المواقع، التكامل مع ERP/WMS/TMS، ودعم مخصص باتفاقية مستوى خدمة.",
    highlight: false,
  },
];

const roleShortcuts: Record<string, { to: string; label: string; icon: typeof Truck; desc: string }[]> = {
  driver: [
    { to: "/booking", label: "حجز موعد جديد", icon: CalendarClock, desc: "احجز موعد تحميل أو تفريغ" },
    { to: "/my-appointment", label: "مواعيدي", icon: Truck, desc: "تتبّع حالة موعدك لحظيًا" },
  ],
  gate_agent: [
    { to: "/gate", label: "البوابة", icon: ScanLine, desc: "سجّل وصول ودخول الشاحنات" },
  ],
  dock_operator: [
    { to: "/dock-ops", label: "عمليات الرصيف", icon: Warehouse, desc: "ابدأ وأنهِ عمليات التحميل والتفريغ" },
  ],
  admin: [
    { to: "/admin", label: "لوحة المسؤول", icon: LayoutDashboard, desc: "راقب المؤشرات والأرصفة والبوابات" },
    { to: "/queue", label: "الطابور الحي", icon: ListOrdered, desc: "تابع كل الطوابير لحظيًا" },
    { to: "/settings", label: "الإعدادات", icon: Settings, desc: "بيانات المصنع وساعات العمل" },
  ],
};

export function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    const shortcuts = roleShortcuts[user.role] ?? [];
    return (
      <div className="mx-auto max-w-2xl py-6">
        <div className="mb-8">
          <p className="text-sm text-ink/50">أهلاً بعودتك</p>
          <p className="text-2xl font-bold text-ink">{user.fullName}</p>
          <p className="mt-1 text-xs font-medium text-brand">{roleLabels[user.role]}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {shortcuts.map(({ to, label, icon: Icon, desc }) => (
            <Card
              key={to}
              className="cursor-pointer p-5 transition-shadow hover:shadow-md"
              onClick={() => navigate(to)}
            >
              <Icon size={22} className="mb-3 text-brand" />
              <p className="mb-1 text-base font-semibold text-ink">{label}</p>
              <p className="text-xs text-ink/50">{desc}</p>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // زائر غير مسجّل دخول: صفحة تعريفية بالمنصة، بلا اختصارات وظيفية
  return (
    <div className="mx-auto max-w-3xl py-4">
      <div className="mb-12 text-center">
        <img src="/logo.svg" alt="Logivio" className="mx-auto mb-5 h-16 w-16" />
        <h1 className="mb-3 text-3xl font-bold text-ink">
          نظّم تدفق شاحناتك <span className="text-brand">رقميًا</span>
        </h1>
        <p className="mx-auto mb-7 max-w-lg text-sm leading-6 text-ink/60">
          منصة Logivio تحوّل استقبال الشاحنات داخل موقعك الصناعي من مكالمات هاتفية وجداول Excel
          إلى نظام رقمي مركزي: حجز، طوابير، بوابات، وأرصفة — كل ذلك بلا تعارض ولا انتظار عشوائي.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button size="lg" onClick={() => navigate("/register")}>إنشاء حساب</Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/login")}>تسجيل الدخول</Button>
          <Button size="lg" variant="ghost" onClick={() => navigate("/onboarding")}>كيف تعمل المنصة؟</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {features.map(({ icon: Icon, title, desc }) => (
          <Card key={title} className="p-5">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-brand-soft text-brand">
              <Icon size={18} />
            </div>
            <p className="mb-1 text-sm font-semibold text-ink">{title}</p>
            <p className="text-xs leading-5 text-ink/55">{desc}</p>
          </Card>
        ))}
      </div>

      <div className="mt-14">
        <div className="mb-6 text-center">
          <p className="mb-1.5 text-lg font-bold text-ink">التسعير حسب عدد الأرصفة</p>
          <p className="mx-auto max-w-md text-xs leading-5 text-ink/55">
            الاشتراك يُحتسب حسب عدد الأرصفة المُدارة في موقعك، فتدفع فقط مقابل السعة التي تحتاجها فعليًا —
            هذا شرح لآلية التسعير في هذا النموذج الأولي، وليست عملية دفع فعلية بعد.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {pricingTiers.map(({ name, docksRange, desc, highlight }) => (
            <Card key={name} className={`p-5 ${highlight ? "border-brand ring-1 ring-brand" : ""}`}>
              {highlight && (
                <span className="mb-2 inline-block rounded-sm bg-brand-soft px-2 py-0.5 text-[11px] font-medium text-brand">
                  الأكثر ملاءمة
                </span>
              )}
              <p className="mb-1 text-sm font-semibold text-ink">{name}</p>
              <p className="mb-2 text-xs font-medium text-brand">{docksRange}</p>
              <p className="text-xs leading-5 text-ink/55">{desc}</p>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-10 flex items-center justify-center gap-2 text-xs text-ink/40">
        <Clock size={13} />
        نموذج أولي — الصناعات الغذائية أولاً
      </div>
    </div>
  );
}
