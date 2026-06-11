const PRODUCTION_API_URL = 'https://caremind-api.onrender.com/api';

export const API_URL: string =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, '') || PRODUCTION_API_URL;

const getHeaders = (): HeadersInit => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const email = localStorage.getItem('@caremind:kayitliEposta');
  if (email) {
    headers['X-User-Email'] = email.trim();
  }
  return headers;
};

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  const url = `${API_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Bir hata oluştu' }));
    throw new Error(error.message || error.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await apiFetch<T>(path);
  return res.data;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await apiFetch<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return res.data;
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const res = await apiFetch<T>(path, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  return res.data;
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await apiFetch<T>(path, { method: 'DELETE' });
  return res.data;
}
