import { useEffect, useState } from "react";
import api from "../services/api";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(Boolean(token));
  const isAuthenticated = Boolean(token);

  function login(nextToken, nextUser = null) {
    localStorage.setItem("token", nextToken);
    setToken(nextToken);
    setUser(nextUser);
  }

  async function logout() {
    try {
      await api.post("/api/auth/logout");
    } catch {
      // Ignore errors — always clear local state
    } finally {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    }
  }

  function updateUser(nextUser) {
    setUser(nextUser);
  }

  useEffect(() => {
    let isActive = true;

    async function fetchUser() {
      if (!token) {
        setIsLoadingUser(false);
        return;
      }

      setIsLoadingUser(true);

      try {
        const response = await api.get("/api/auth/me");
        const nextUser = response?.data?.data?.user || null;

        if (isActive) {
          setUser(nextUser);
        }
      } catch {
        if (isActive) {
          logout();
        }
      } finally {
        if (isActive) {
          setIsLoadingUser(false);
        }
      }
    }

    fetchUser();

    return () => {
      isActive = false;
    };
  }, [token]);

  const value = {
    token,
    user,
    isLoadingUser,
    isAuthenticated,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
