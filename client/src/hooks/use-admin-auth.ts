import { useState, useEffect } from "react";

const ADMIN_SESSION_KEY = "admin_authenticated";
const SESSION_DURATION = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

interface AdminSession {
  authenticated: boolean;
  timestamp: number;
}

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const sessionData = localStorage.getItem(ADMIN_SESSION_KEY);
      if (sessionData) {
        const session: AdminSession = JSON.parse(sessionData);
        const now = Date.now();
        
        // Check if session is still valid (within 2 hours)
        if (session.authenticated && (now - session.timestamp) < SESSION_DURATION) {
          setIsAuthenticated(true);
        } else {
          // Session expired, clear it
          localStorage.removeItem(ADMIN_SESSION_KEY);
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      // If there's any error parsing session data, clear it
      localStorage.removeItem(ADMIN_SESSION_KEY);
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  };

  const login = (password: string) => {
    // In a real app, you'd verify this with a backend
    if (password === "Kopia15341534!") {
      const session: AdminSession = {
        authenticated: true,
        timestamp: Date.now(),
      };
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
}