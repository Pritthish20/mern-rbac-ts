const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

type RequestOptions = RequestInit & {
  token?: string;
};

type ApiErrorPayload = {
  message?: string;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, headers, ...rest } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    }
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = (await response.json().catch(() => null)) as ApiErrorPayload | null;

  if (!response.ok) {
    throw new Error(payload?.message || "Request failed");
  }

  return payload as T;
}
