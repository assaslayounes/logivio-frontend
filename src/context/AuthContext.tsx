import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { api } from "@/lib/api";

export type UserRole = "admin" | "gate_agent" | "dock_operator" | "driver";
// الأدوار التي يمكن التسجيل بها كموظف ضمن مصنع قائم (admin يُستثنى، له مسار registerFactory الخاص)
export type OperationalRole = Exclude<UserRole, "admin">;

export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  facilityId: number;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (input: {
    fullName: string; email: string; password: string; role: OperationalRole; facilityId: number;
  }) => Promise<AuthUser>;
  registerFactory: (input: {
    facilityName: string; fullName: string; email: string; password: string;
  }) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem("capaflow_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(readStoredUser);

  const persist = (token: string, u: AuthUser) => {
    localStorage.setItem("capaflow_token", token);
    localStorage.setItem("capaflow_user", JSON.stringify(u));
    setUser(u);
  };

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<{ token: string; user: AuthUser }>("/auth/login", { email, password });
    persist(data.token, data.user);
    return data.user;
  }, []);

  const register = useCallback(
    async (input: { fullName: string; email: string; password: string; role: OperationalRole; facilityId: number }) => {
      const { data } = await api.post<{ token: string; user: AuthUser }>("/auth/register", input);
      persist(data.token, data.user);
      return data.user;
    },
    []
  );

  const registerFactory = useCallback(
    async (input: { facilityName: string; fullName: string; email: string; password: string }) => {
      const { data } = await api.post<{ token: string; user: AuthUser }>("/auth/register-factory", input);
      persist(data.token, data.user);
      return data.user;
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem("capaflow_token");
    localStorage.removeItem("capaflow_user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, registerFactory, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth يجب أن يُستخدم داخل AuthProvider");
  return ctx;
}
