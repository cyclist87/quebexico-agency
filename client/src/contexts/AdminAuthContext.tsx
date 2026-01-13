import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface AdminAuthContextValue {
  isAuthenticated: boolean;
  adminKey: string | null;
  login: (key: string) => Promise<boolean>;
  logout: () => void;
  isDevMode: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

const ADMIN_KEY_STORAGE = "qbx_admin_key";

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [adminKey, setAdminKey] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const isDevMode = import.meta.env.DEV;

  useEffect(() => {
    const storedKey = sessionStorage.getItem(ADMIN_KEY_STORAGE);
    if (storedKey) {
      validateKey(storedKey).then((valid) => {
        if (valid) {
          setAdminKey(storedKey);
          setIsAuthenticated(true);
        } else {
          sessionStorage.removeItem(ADMIN_KEY_STORAGE);
        }
      });
    }
  }, []);

  async function validateKey(key: string): Promise<boolean> {
    try {
      const response = await fetch("/api/auth/verify-session", {
        headers: { "x-admin-key": key },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async function login(key: string): Promise<boolean> {
    const valid = await validateKey(key);
    if (valid) {
      sessionStorage.setItem(ADMIN_KEY_STORAGE, key);
      setAdminKey(key);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }

  function logout() {
    sessionStorage.removeItem(ADMIN_KEY_STORAGE);
    setAdminKey(null);
    setIsAuthenticated(false);
  }

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, adminKey, login, logout, isDevMode }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
}

export function getAdminKey(): string | null {
  return sessionStorage.getItem(ADMIN_KEY_STORAGE);
}
