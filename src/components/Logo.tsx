interface LogoProps {
  size?: number;
  withWordmark?: boolean;
  className?: string;
}

/**
 * علامة CapaFlow: مربع بلون العلامة التجارية (تيل صناعي) يحتوي مسارين متوازيين
 * (يمثلان حارتي حركة الشاحنات) مع نقطة كهرمانية تمثل شاحنة تتقدم في تدفق منظّم.
 */
export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="10" fill="#0F3D3E" />
      <path d="M9 15.5H24" stroke="#F7F5F0" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M9 24.5H31" stroke="#F7F5F0" strokeWidth="2.6" strokeLinecap="round" opacity="0.55" />
      <path d="M20 11.5L24 15.5L20 19.5" stroke="#F7F5F0" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="31" cy="24.5" r="3.4" fill="#C2410C" />
    </svg>
  );
}

export function Logo({ size = 36, withWordmark = true, className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} />
      {withWordmark && (
        <span className="text-lg font-extrabold tracking-tight text-brand" style={{ fontFamily: "Cairo" }}>
          CapaFlow
        </span>
      )}
    </div>
  );
}
