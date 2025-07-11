import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";

const TOKEN_KEY = "admin_jwt_token";

interface LoginResponse {
  token: string;
  expiresIn: string;
  message: string;
}

interface VerifyResponse {
  valid: boolean;
  isAdmin: boolean;
}

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Verify token with backend
      const response = await fetch("/api/auth/verify", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data: VerifyResponse = await response.json();
        setIsAuthenticated(data.valid && data.isAdmin);
      } else {
        // Token is invalid or expired
        localStorage.removeItem(TOKEN_KEY);
        setIsAuthenticated(false);
      }
    } catch (error) {
      // Network error or other issue
      console.error("Auth check failed:", error);
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  };

  const login = async (password: string): Promise<boolean> => {
    try {
      const response = await apiRequest<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ password }),
      });

      if (response.token) {
        localStorage.setItem(TOKEN_KEY, response.token);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setIsAuthenticated(false);
  };

  const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
    getToken,
  };
}