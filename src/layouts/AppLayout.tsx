import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth, type UserRole } from "@/context/AuthContext";
import { roleLabels } from "@/lib/roleHomePath";
import { LogoMark } from "@/components/Logo";
import {
  CalendarClock, LayoutDashboard, ScanLine, ListOrdered, Home,
  Truck, Warehouse, Settings, Menu, X, LogOut, LogIn,
} from "lucide-react";

interface NavItem {
  to: string;
  label: string;
  icon: typeof Home;
  roles?: UserRole[]; // غير محدد = يظهر للجميع (بمن فيهم الزائر)
}

const navItems: NavItem[] = [
  { to: "/", label: "الرئيسية", icon: Home },
  { to: "/booking", label: "حجز موعد", icon: CalendarClock, roles: ["driver"] },
  { to: "/my-appointment", label: "مواعيدي", icon: Truck, roles: ["driver"] },
  { to: "/gate", label: "البوابة", icon: ScanLine, roles: ["gate_agent"] },
  { to: "/dock-ops", label: "عمليات الرصيف", icon: Warehouse, roles: ["dock_operator"] },
  { to: "/queue", label: "الطابور الحي", icon: ListOrdered, roles: ["admin"] },
  { to: "/admin", label: "لوحة المسؤول", icon: LayoutDashboard, roles: ["admin"] },
  { to: "/settings", label: "الإعدادات", icon: Settings, roles: ["admin"] },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const visibleItems = navItems.filter((item) => !item.roles || (user && item.roles.includes(user.role)));

  const handleLogout = () => {
    logout();
    setDrawerOpen(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-canvas" dir="rtl">
      {/* شريط علوي - يظهر فقط على الهاتف */}
      <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 md:hidden">
        <button onClick={() => setDrawerOpen(true)} aria-label="القائمة">
          <Menu size={22} className="text-ink" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-brand">CapaFlow</span>
          <LogoMark size={24} />
        </div>
      </header>

      <div
        className="flex min-h-screen bg-canvas md:mx-auto md:max-w-[1440px] md:border-x md:border-border"
        style={{ backgroundImage: "url(/bg-pattern.svg)", backgroundRepeat: "repeat" }}
      >
        {/* القائمة الجانبية - ثابتة على الحاسوب، منسدلة على الهاتف */}
        <aside
          className={cn(
            "fixed inset-y-0 right-0 z-40 w-64 shrink-0 border-l border-border bg-surface px-4 py-6 transition-transform md:static md:translate-x-0",
            drawerOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
          )}
        >
          <div className="mb-8 flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <LogoMark size={32} />
              <div>
                <p className="text-lg font-bold text-brand leading-none">CapaFlow</p>
                <p className="text-[11px] text-ink/50">إدارة تدفق الشاحنات</p>
              </div>
            </div>
            <button className="md:hidden" onClick={() => setDrawerOpen(false)} aria-label="إغلاق">
              <X size={20} className="text-ink/50" />
            </button>
          </div>

          <nav className="flex flex-col gap-1">
            {visibleItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                onClick={() => setDrawerOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive ? "bg-brand-soft text-brand" : "text-ink/60 hover:bg-canvas hover:text-ink"
                  )
                }
              >
                <Icon size={17} strokeWidth={2} />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="absolute inset-x-4 bottom-6 border-t border-border pt-4">
            {user ? (
              <div>
                <p className="mb-2 truncate text-xs text-ink/50">
                  {user.fullName} · {roleLabels[user.role]}
                </p>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-danger hover:bg-danger-soft"
                >
                  <LogOut size={16} />
                  تسجيل الخروج
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setDrawerOpen(false);
                  navigate("/login");
                }}
                className="flex w-full items-center gap-2 rounded-md bg-brand-soft px-3 py-2 text-sm font-medium text-brand"
              >
                <LogIn size={16} />
                تسجيل الدخول
              </button>
            )}
          </div>
        </aside>

        {drawerOpen && (
          <div className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={() => setDrawerOpen(false)} />
        )}

        <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-7">
          <div className="w-full md:mx-auto md:max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
