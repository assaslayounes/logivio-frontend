import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onScan: (text: string) => void;
  onClose: () => void;
}

const REGION_ID = "capaflow-qr-region";

/**
 * قارئ رمز QR بالكاميرا الخلفية للجهاز.
 * ملاحظة: المتصفحات تسمح بالوصول للكاميرا فقط عبر HTTPS (أو localhost أثناء التطوير).
 */
export function QrScanner({ onScan, onClose }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const handledRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const scanner = new Html5Qrcode(REGION_ID);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decodedText) => {
          // نتجنّب استدعاء onScan أكثر من مرة لنفس المسح
          if (handledRef.current) return;
          handledRef.current = true;
          onScan(decodedText.trim());
        },
        () => {
          /* إطارات لم يُعثر فيها على رمز: تُتجاهل */
        }
      )
      .catch((err: unknown) => {
        if (cancelled) return;
        const msg = String(err);
        if (/permission|denied|notallowed/i.test(msg)) {
          setError("لم يُسمح بالوصول إلى الكاميرا. فعّل إذن الكاميرا لهذا الموقع من إعدادات المتصفح ثم أعد المحاولة.");
        } else if (/secure|https/i.test(msg)) {
          setError("الكاميرا تعمل فقط عبر اتصال آمن (HTTPS).");
        } else {
          setError("تعذّر تشغيل الكاميرا على هذا الجهاز. يمكنك إدخال الرمز يدويًا.");
        }
      });

    return () => {
      cancelled = true;
      const s = scannerRef.current;
      if (s) {
        // الإيقاف قد يفشل إن لم تكن الكاميرا قد بدأت بعد؛ نتجاهل الخطأ بأمان
        s.stop()
          .then(() => s.clear())
          .catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-lg bg-surface p-4"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-ink">وجّه الكاميرا نحو رمز QR</p>
          <button onClick={onClose} aria-label="إغلاق">
            <X size={18} className="text-ink/40" />
          </button>
        </div>

        <div id={REGION_ID} className="overflow-hidden rounded-md bg-black" style={{ minHeight: 260 }} />

        {error && <p className="mt-3 rounded-md bg-danger-soft p-3 text-xs leading-5 text-danger">{error}</p>}

        <Button variant="outline" className="mt-3 w-full" onClick={onClose}>
          إدخال الرمز يدويًا
        </Button>
      </div>
    </div>
  );
}
