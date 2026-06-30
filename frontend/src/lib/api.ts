type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  meta?: unknown;
  error?: {
    code: string;
    message: string;
    details?: string[];
  };
  request_id: string;
};

type RequestOptions = {
  method?: string;
  body?: unknown;
  retryOnUnauthorized?: boolean;
};

export class ApiError extends Error {
  code: string;
  requestId?: string;
  details?: string[];

  constructor(message: string, code: string, requestId?: string, details?: string[]) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.requestId = requestId;
    this.details = details;
  }
}

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

class ApiClient {
  private accessToken: string | null = null;

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  get<T>(path: string) {
    return this.request<T>(path);
  }

  post<T>(path: string, body: unknown) {
    return this.request<T>(path, { method: "POST", body });
  }

  put<T>(path: string, body: unknown) {
    return this.request<T>(path, { method: "PUT", body });
  }

  delete<T>(path: string) {
    return this.request<T>(path, { method: "DELETE" });
  }

  private async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const response = await fetch(`${baseUrl}${path}`, {
      method: options.method ?? "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (response.status === 401 && options.retryOnUnauthorized !== false) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        return this.request<T>(path, { ...options, retryOnUnauthorized: false });
      }
    }

    const envelope = (await response.json()) as ApiEnvelope<T>;
    if (!response.ok || !envelope.success) {
      throw new ApiError(
        envelope.error?.message ?? "Request gagal",
        envelope.error?.code ?? "REQUEST_ERROR",
        envelope.request_id,
        envelope.error?.details,
      );
    }

    return envelope.data;
  }

  private async refreshAccessToken() {
    const response = await fetch(`${baseUrl}/api/v1/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!response.ok) {
      this.setAccessToken(null);
      return false;
    }

    const envelope = (await response.json()) as ApiEnvelope<{ access_token: string }>;
    if (!envelope.success) {
      this.setAccessToken(null);
      return false;
    }

    this.setAccessToken(envelope.data.access_token);
    window.localStorage.setItem("moneymate_access_token", envelope.data.access_token);
    return true;
  }
}

export const apiClient = new ApiClient();
