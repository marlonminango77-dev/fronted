const API_URL = import.meta.env.VITE_API_URL ?? "/api";

type ApiErrorBody = {
  error?: string;
  message?: string;
  campos?: Record<string, string>;
};

export class ApiError extends Error {
  status: number;
  details?: ApiErrorBody;

  constructor(message: string, status: number, details?: ApiErrorBody) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

let csrfToken: string | null = null;
let csrfHeader = "X-XSRF-TOKEN";

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) return undefined as T;

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const details = body as ApiErrorBody;
    throw new ApiError(
      details.error ?? details.message ?? `Error HTTP ${response.status}`,
      response.status,
      details,
    );
  }
  return body as T;
}

async function ensureCsrf() {
  if (csrfToken) return;
  const response = await fetch(`${API_URL}/auth/csrf`, {
    credentials: "include",
  });
  const data = await parseResponse<{ token: string; headerName: string }>(
    response,
  );
  csrfToken = data.token;
  csrfHeader = data.headerName;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const method = options.method ?? "GET";
  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    try { await ensureCsrf(); }
    catch {
      if (window.location.pathname !== "/servidor-desconectado") window.location.assign("/servidor-desconectado");
      throw new ApiError("No se pudo conectar con el servidor.", 0);
    }
  }

  const headers = new Headers(options.headers);
  if (options.body) headers.set("Content-Type", "application/json");
  if (csrfToken && !["GET", "HEAD", "OPTIONS"].includes(method)) {
    headers.set(csrfHeader, csrfToken);
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      credentials: "include",
    });
  } catch {
    if (window.location.pathname !== "/servidor-desconectado") {
      window.location.assign("/servidor-desconectado");
    }
    throw new ApiError("No se pudo conectar con el servidor.", 0);
  }

  if (response.status === 401 && path !== "/auth/login") {
    csrfToken = null;
    if (window.location.pathname !== "/login") {
      window.location.assign("/login?sesion=expirada");
    }
  }

  if (response.status === 403) {
    csrfToken = null;
    if (window.location.pathname !== "/403") window.location.assign("/403");
  }

  return parseResponse<T>(response);
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: (path: string) => request<void>(path, { method: "DELETE" }),
  resetCsrf: () => {
    csrfToken = null;
  },
};

export function getApiErrorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  return "No se pudo conectar con el servidor.";
}
