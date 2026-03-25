export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Queue concurrent requests that arrive while a token refresh is in flight.
let isRefreshing = false;
let refreshQueue: Array<(ok: boolean) => void> = [];

function drainQueue(ok: boolean) {
  refreshQueue.forEach((resolve) => resolve(ok));
  refreshQueue = [];
}

async function tryRefresh(): Promise<boolean> {
  if (isRefreshing) {
    return new Promise((resolve) => refreshQueue.push(resolve));
  }

  isRefreshing = true;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    const ok = res.ok;
    drainQueue(ok);
    return ok;
  } catch {
    drainQueue(false);
    return false;
  } finally {
    isRefreshing = false;
  }
}

function redirectToLogin() {
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });

  if (res.status === 401) {
    // Skip refresh for auth endpoints to avoid loops.
    if (endpoint.startsWith('/auth/')) {
      redirectToLogin();
      throw new Error('Unauthorized');
    }

    const refreshed = await tryRefresh();
    if (!refreshed) {
      redirectToLogin();
      throw new Error('Unauthorized');
    }

    // Retry the original request with fresh cookies.
    const retry = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...options?.headers },
    });

    if (!retry.ok) {
      if (retry.status === 401) {
        redirectToLogin();
        throw new Error('Unauthorized');
      }
      const body = await retry.json().catch(() => ({}));
      throw new Error(body.message || `API error: ${retry.status}`);
    }

    if (retry.status === 204) return undefined as T;
    return retry.json();
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `API error: ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}
