import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { api } from "@/lib/api";

export type UserRole = "admin" | "gate_agent" | "dock_operator" | "driver";

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
  register: (input: { fullName: string; email: string; password: string; role: UserRole }) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem("logivio_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(readStoredUser);

  const persist = (token: string, u: AuthUser) => {
    localStorage.setItem("logivio_token", token);
    localStorage.setItem("logivio_user", JSON.stringify(u));
    setUser(u);
  };

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<{ token: string; user: AuthUser }>("/auth/login", { email, password });
    persist(data.token, data.user);
    return data.user;
  }, []);

  const register = useCallback(
    async (input: { fullName: string; email: string; password: string; role: UserRole }) => {
      const { data } = await api.post<{ token: string; user: AuthUser }>("/auth/register", input);
      persist(data.token, data.user);
      return data.user;
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem("logivio_token");
    localStorage.removeItem("logivio_user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth يجب أن يُستخدم داخل AuthProvider");
  return ctx;
}
