import { config } from "../config";

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
  multipart?: boolean;
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

  upload<T>(path: string, body: FormData) {
    return this.request<T>(path, { method: "POST", body, multipart: true });
  }

  download(path: string) {
    return this.requestBlob(path);
  }

  put<T>(path: string, body: unknown) {
    return this.request<T>(path, { method: "PUT", body });
  }

  delete<T>(path: string) {
    return this.request<T>(path, { method: "DELETE" });
  }

  private async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const headers: Record<string, string> = {
      ...(this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {}),
    };
    if (!options.multipart) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${config.apiBaseUrl}${path}`, {
      method: options.method ?? "GET",
      credentials: "include",
      headers,
      body: this.requestBody(options),
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

  private async requestBlob(path: string, retryOnUnauthorized = true): Promise<Blob> {
    const response = await fetch(`${config.apiBaseUrl}${path}`, {
      method: "GET",
      credentials: "include",
      headers: {
        ...(this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {}),
      },
    });

    if (response.status === 401 && retryOnUnauthorized) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        return this.requestBlob(path, false);
      }
    }

    if (!response.ok) {
      const envelope = await response.json().catch(() => null) as ApiEnvelope<unknown> | null;
      throw new ApiError(
        envelope?.error?.message ?? "Download gagal",
        envelope?.error?.code ?? "REQUEST_ERROR",
        envelope?.request_id,
        envelope?.error?.details,
      );
    }

    return response.blob();
  }

  private requestBody(options: RequestOptions): BodyInit | undefined {
    if (!options.body) {
      return undefined;
    }
    if (options.multipart) {
      return options.body as BodyInit;
    }
    return JSON.stringify(options.body);
  }

  private async refreshAccessToken() {
    const response = await fetch(`${config.apiBaseUrl}/api/v1/auth/refresh`, {
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
