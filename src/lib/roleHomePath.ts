import type { UserRole } from "@/context/AuthContext";

export function roleHomePath(role: UserRole): string {
  switch (role) {
    case "driver":
      return "/my-appointment";
    case "gate_agent":
      return "/gate";
    case "dock_operator":
      return "/dock-ops";
    case "admin":
      return "/admin";
    default:
      return "/";
  }
}

export const roleLabels: Record<UserRole, string> = {
  driver: "سائق",
  gate_agent: "حارس بوابة",
  dock_operator: "مسؤول رصيف",
  admin: "مسؤول المنصة",
};
