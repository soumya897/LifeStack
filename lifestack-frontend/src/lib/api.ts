export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  timezone: string;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  description: string;
  settings: string;
  createdAt: string;
  updatedAt: string;
}

export interface HealthCheckData {
  status: string;
  version: string;
  environment: string;
  timestamp: string;
  checks: {
    database: {
      status: string;
      product?: string;
      version?: string;
      error?: string;
    };
  };
}

export interface RegisterPayload {
  email: string;
  password: string;
  displayName: string;
  timezone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export class ApiError extends Error {
  constructor(public status: number, message: string, public data?: unknown) {
    super(message);
    this.name = 'ApiError';
  }
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'same-origin',
  });

  const body: ApiResponse<T> = await response.json().catch(() => ({
    success: false,
    message: response.statusText || 'Network request failed',
    data: null as unknown as T,
    timestamp: new Date().toISOString(),
  }));

  if (!response.ok || !body.success) {
    throw new ApiError(response.status, body.message || 'API error occurred', body.data);
  }

  return body;
}

export const api = {
  health: {
    check: () => apiClient<HealthCheckData>('/health'),
  },
  auth: {
    register: (payload: RegisterPayload) =>
      apiClient<User>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    login: (payload: LoginPayload) =>
      apiClient<User>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    logout: () =>
      apiClient<void>('/auth/logout', {
        method: 'POST',
      }),
  },
  users: {
    me: () => apiClient<User>('/users/me'),
  },
  workspaces: {
    list: () => apiClient<Workspace[]>('/workspaces'),
    get: (id: string) => apiClient<Workspace>(`/workspaces/${id}`),
    create: (payload: { name: string; description?: string }) =>
      apiClient<Workspace>('/workspaces', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },
};
