import type { ReactNode } from "react";
import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { apiClient } from "../helpers/api-client";

export type AuthUser = {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "user";
  is_active: boolean;
};

type LoginInput = {
  email: string;
  password: string;
};

type AuthContextValue = {
  accessToken: string | null;
  user: AuthUser | null;
  isBootstrapping: boolean;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

const storageKey = "moneymate_access_token";

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    window.localStorage.getItem(storageKey),
  );
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const persistToken = useCallback((token: string | null) => {
    setAccessToken(token);
    apiClient.setAccessToken(token);
    if (token) {
      window.localStorage.setItem(storageKey, token);
    } else {
      window.localStorage.removeItem(storageKey);
    }
  }, []);

  useEffect(() => {
    apiClient.setAccessToken(accessToken);
    if (!accessToken) {
      setIsBootstrapping(false);
      return;
    }

    apiClient
      .get<AuthUser>("/api/v1/auth/me")
      .then(setUser)
      .catch(() => {
        persistToken(null);
        setUser(null);
      })
      .finally(() => setIsBootstrapping(false));
  }, [accessToken, persistToken]);

  const login = useCallback(
    async (input: LoginInput) => {
      const result = await apiClient.post<{
        access_token: string;
        user: AuthUser;
      }>("/api/v1/auth/login", input);
      persistToken(result.access_token);
      setUser(result.user);
    },
    [persistToken],
  );

  const logout = useCallback(async () => {
    try {
      await apiClient.post("/api/v1/auth/logout", {});
    } finally {
      persistToken(null);
      setUser(null);
    }
  }, [persistToken]);

  const value = useMemo<AuthContextValue>(
    () => ({ accessToken, user, isBootstrapping, login, logout }),
    [accessToken, user, isBootstrapping, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
