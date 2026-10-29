/**
 * LifeStack Cloud Wake-Up Service
 * Silently pings the backend health verification endpoint to warm up sleep-on-idle
 * cloud containers (e.g. Render, Railway, Fly.io) and database connection pools (PostgreSQL/Supabase)
 * before users begin interacting with the application.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

let isPinging = false;
let hasSuccessfullyPinged = false;

export async function pingBackendSilently(): Promise<boolean> {
  if (isPinging || hasSuccessfullyPinged) return hasSuccessfullyPinged;
  isPinging = true;

  try {
    const url = `${BASE_URL}/health`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      credentials: 'same-origin',
      keepalive: true,
    });

    if (response.ok) {
      hasSuccessfullyPinged = true;
      return true;
    }
    return false;
  } catch {
    // Catch fetch network errors silently: server might still be waking up
    return false;
  } finally {
    isPinging = false;
  }
}

/**
 * Checks if the backend and database connection is ready.
 */
export async function checkBackendReadiness(): Promise<{ ready: boolean; status?: string }> {
  try {
    const url = `${BASE_URL}/health`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      credentials: 'same-origin',
    });

    if (!response.ok) {
      return { ready: false, status: 'STARTING' };
    }

    const data = await response.json();
    const isUp = data?.success && (data?.data?.status === 'UP' || data?.data?.status === 'DEGRADED');
    return { ready: Boolean(isUp), status: data?.data?.status || 'UP' };
  } catch {
    return { ready: false, status: 'OFFLINE' };
  }
}

