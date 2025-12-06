import { QueryClient, QueryFunction } from "@tanstack/react-query";

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") || "";

export const withApiBase = (path: string) => {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  if (!API_BASE) return path;
  return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
};

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest<T = any>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  // Get the token from localStorage
  const token = localStorage.getItem("admin_jwt_token");
  
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  // Add Content-Type for JSON body
  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  // Add Authorization header if token exists
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(withApiBase(url), {
    ...options,
    headers,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return await res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Get the token from localStorage
    const token = localStorage.getItem("admin_jwt_token");
    
    const headers: Record<string, string> = {};
    
    // Add Authorization header if token exists
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const [root, ...rest] = queryKey as unknown as string[];
    const path = [root, ...rest].join("/");
    const res = await fetch(withApiBase(path), {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 10 * 60 * 1000, // 10 minutes for better caching
      gcTime: 30 * 60 * 1000, // 30 minutes cache retention
      retry: 1,
    },
    mutations: {
      retry: false,
    },
  },
});
