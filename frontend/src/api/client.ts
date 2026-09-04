const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  // Read current user from localStorage to inject auth headers
  const storedUser = localStorage.getItem('current_user');
  let currentUserId: string | null = null;
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      if (parsed?.id) {
        currentUserId = String(parsed.id);
      }
    } catch {
      // ignore parse error
    }
  }

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (currentUserId && !headers.has('X-User-Id')) {
    headers.set('X-User-Id', currentUserId);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (networkErr: any) {
    throw new ApiError(
      'Unable to connect to the backend API server. Please verify that FastAPI is running on http://localhost:8000.',
      0,
      networkErr
    );
  }

  if (!response.ok) {
    let errorDetail = `Request failed with status ${response.status}`;
    let errorData = null;
    try {
      errorData = await response.json();
      if (errorData?.detail) {
        if (typeof errorData.detail === 'string') {
          errorDetail = errorData.detail;
        } else if (Array.isArray(errorData.detail)) {
          errorDetail = errorData.detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ');
        }
      }
    } catch {
      // response wasn't json
    }
    throw new ApiError(errorDetail, response.status, errorData);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}
