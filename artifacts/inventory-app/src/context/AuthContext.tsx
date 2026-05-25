import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { setAuthTokenGetter } from "@workspace/api-client-react";

const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, "");

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "inventorypro_token";
const USER_KEY  = "inventorypro_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken]   = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser]     = useState<AuthUser | null>(() => {
    try {
      const s = localStorage.getItem(USER_KEY);
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Wire up the Bearer token getter for all API client hooks
  useEffect(() => {
    setAuthTokenGetter(() => token);
  }, [token]);

  // On mount, verify the stored token is still valid
  useEffect(() => {
    if (!token) {
      setIsLoaded(true);
      return;
    }
    fetch(`${BASE_PATH}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error("Invalid token");
        return r.json();
      })
      .then((u: AuthUser) => {
        setUser(u);
        localStorage.setItem(USER_KEY, JSON.stringify(u));
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => setIsLoaded(true));
  }, []);

  const persist = useCallback((t: string, u: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, t);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setToken(t);
    setUser(u);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${BASE_PATH}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      const msg =
        data?.errors?.email?.[0] ??
        data?.errors?.password?.[0] ??
        data?.message ??
        "Login failed";
      throw new Error(msg);
    }
    persist(data.token, data.user);
  }, [persist]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await fetch(`${BASE_PATH}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ name, email, password, password_confirmation: password }),
    });
    const data = await res.json();
    if (!res.ok) {
      const firstError =
        Object.values(data?.errors ?? {}).flat()[0] as string ??
        data?.message ??
        "Registration failed";
      throw new Error(firstError);
    }
    persist(data.token, data.user);
  }, [persist]);

  const logout = useCallback(async () => {
    if (token) {
      await fetch(`${BASE_PATH}/api/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      }).catch(() => {});
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    setAuthTokenGetter(null);
  }, [token]);

  return (
    <AuthContext.Provider
      value={{ user, token, isLoaded, isSignedIn: !!token && !!user, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
