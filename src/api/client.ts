// API klienti.
// VITE_API_URL berilmasa — backend yo'q: ma'lumotlar brauzer ichidagi demo bazadan olinadi (src/api/mock).
// VITE_API_URL berilsa (masalan: https://api.sizning-domen.uz/api) — haqiqiy backendga so'rov yuboriladi.
import { ApiError } from "./errors";
import { mockRequest } from "./mock/routes";

const RAW_URL = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
export const USE_MOCK = !RAW_URL;
const API_URL = RAW_URL ? RAW_URL.replace(/\/$/, "") : "";
const TOKEN_KEY = "crm_token";

export const tokenStore = {
  get: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (token: string) => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* private mode */
    }
  },
  clear: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* private mode */
    }
  },
};

export { ApiError };

/** 401 bo'lganda AuthContext tinglaydigan hodisa */
export const AUTH_EXPIRED_EVENT = "crm:auth-expired";

type Query = Record<string, string | number | boolean | undefined | null>;

async function request<T>(method: string, path: string, body?: unknown, query?: Query): Promise<T> {
  if (USE_MOCK) {
    try {
      const q: Record<string, string> = {};
      for (const [k, v] of Object.entries(query ?? {})) if (v !== undefined && v !== null && v !== "") q[k] = String(v);
      return mockRequest(method, path, body, q, tokenStore.get()) as T;
    } catch (e) {
      if (e instanceof ApiError && e.status === 401 && tokenStore.get()) {
        tokenStore.clear();
        window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
      }
      throw e;
    }
  }

  const url = new URL(`${API_URL}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
    }
  }

  const token = tokenStore.get();
  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: {
        ...(body !== undefined && { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, "Serverga ulanib bo'lmadi. Internet yoki server holatini tekshiring.");
  }

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && token) {
      tokenStore.clear();
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    }
    throw new ApiError(res.status, data?.error ?? `Xatolik (${res.status})`, data?.details);
  }
  return data as T;
}

export const http = {
  get: <T>(path: string, query?: Query) => request<T>("GET", path, undefined, query),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body ?? {}),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, body ?? {}),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body ?? {}),
  delete: <T = void>(path: string) => request<T>("DELETE", path),
};

/** Xatodan foydalanuvchiga ko'rsatiladigan matn */
export function errorMessage(e: unknown): string {
  if (e instanceof ApiError) {
    const first = e.details?.[0];
    return first ? `${e.message}: ${first.message}` : e.message;
  }
  return e instanceof Error ? e.message : "Noma'lum xatolik";
}
