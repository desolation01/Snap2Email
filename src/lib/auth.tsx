import { createContext, useContext, useState, type ReactNode } from "react";
import type { Role, User } from "../lib/types";
import { auth as authService } from "../lib/store";

const SESSION_KEY = "trucking-ops-session";

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  can: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  login: () => ({ ok: false, error: "No provider" }),
  logout: () => {},
  can: () => false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  });

  const login = (email: string, password: string) => {
    const found = authService.login(email, password);
    if (!found) {
      return { ok: false, error: "Invalid email or password." };
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(found));
    setUser(found);
    return { ok: true };
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  const can = (...roles: Role[]) => (user ? roles.includes(user.role) : false);

  return (
    <AuthContext.Provider value={{ user, login, logout, can }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
