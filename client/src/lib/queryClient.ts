import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getAdminKey } from "@/contexts/AdminAuthContext";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

function getHeaders(data?: unknown, isAdminRoute?: boolean): HeadersInit {
  const headers: Record<string, string> = {};
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  if (isAdminRoute) {
    const adminKey = getAdminKey();
    if (adminKey) {
      headers["x-admin-key"] = adminKey;
    }
  }
  return headers;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const isAdminRoute = url.includes("/admin/");
  const res = await fetch(url, {
    method,
    headers: getHeaders(data, isAdminRoute),
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey.join("/") as string;
    const isAdminRoute = url.includes("/admin/");
    const res = await fetch(url, {
      credentials: "include",
      headers: getHeaders(undefined, isAdminRoute),
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
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
