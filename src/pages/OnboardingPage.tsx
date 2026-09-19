import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";

const steps = [
  {
    image: "/onboarding/driver.svg",
    title: "سائق الشاحنة",
    desc: "احجز موعدك من هاتفك في ثوانٍ، واعرف بالضبط متى تصل ولأي رصيف تتجه — بلا اتصال هاتفي ولا انتظار عشوائي عند البوابة.",
  },
  {
    image: "/onboarding/gate.svg",
    title: "حارس البوابة",
    desc: "امسح رمز الشاحنة فقط، ودع النظام يوجّهها تلقائيًا لأقل بوابة ازدحامًا — بلا أوراق ولا تسجيل يدوي.",
  },
  {
    image: "/onboarding/dock.svg",
    title: "مسؤول الرصيف",
    desc: "اعرف أي شاحنة تنتظر رصيفك بالضبط، وابدأ وأنهِ كل عملية بضغطة واحدة، مع تسجيل أسباب التأخير تلقائيًا.",
  },
  {
    image: "/onboarding/admin.svg",
    title: "مسؤول المنصة",
    desc: "راقب كل الأرصفة والبوابات والمؤشرات لحظيًا من مكان واحد، واتخذ قراراتك بأرقام حقيقية بدل التخمين.",
  },
];

export function OnboardingPage() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const isLast = step === steps.length - 1;
  const current = steps[step];

  const next = () => {
    if (isLast) navigate("/register");
    else setStep((s) => s + 1);
  };

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-md flex-col items-center justify-center py-6 text-center">
      <button
        onClick={() => navigate("/")}
        className="mb-6 self-end text-xs font-medium text-ink/40 hover:text-ink/60"
      >
        تخطّي
      </button>

      <img src={current.image} alt={current.title} className="mb-8 h-52 w-auto" />

      <p className="mb-2 text-xl font-bold text-ink">{current.title}</p>
      <p className="mb-8 text-sm leading-6 text-ink/60">{current.desc}</p>

      <div className="mb-6 flex gap-1.5">
        {steps.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === step ? "w-6 bg-brand" : "w-1.5 bg-border"
            }`}
          />
        ))}
      </div>

      <div className="flex w-full gap-2">
        {step > 0 && (
          <Button variant="outline" size="lg" onClick={() => setStep((s) => s - 1)}>
            <ChevronRight size={16} />
            السابق
          </Button>
        )}
        <Button size="lg" className="flex-1" onClick={next}>
          {isLast ? "إنشاء حساب" : "التالي"}
          {!isLast && <ChevronLeft size={16} />}
        </Button>
      </div>
    </div>
  );
}
