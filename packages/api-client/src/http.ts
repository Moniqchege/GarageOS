const _meta = import.meta as unknown as { env?: Record<string, string> };
const BASE_URL = _meta.env?.VITE_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
    constructor(
        public readonly status: number,
        message: string
    ) {
        super(message);
        this.name = "ApiError";
    }
}

async function parseResponse<T>(res: Response): Promise<T> {
    const contentType = res.headers.get("content-type") ?? "";
    const body = contentType.includes("application/json")
        ? await res.json()
        : await res.text();

    if (!res.ok) {
        const message =
            typeof body === "object" && body !== null && "error" in body
                ? String((body as Record<string, unknown>).error)
                : String(body);
        throw new ApiError(res.status, message);
    }

    return body as T;
}

type RequestOptions = Omit<RequestInit, "body"> & { body?: unknown };

export async function request<T = unknown>(
    path: string,
    options: RequestOptions = {}
): Promise<T> {
    const { body, headers, ...rest } = options;

    const res = await fetch(`${BASE_URL}${path}`, {
        ...rest,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...headers,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    return parseResponse<T>(res);
}

// ─── Convenience helpers ─────────────────────────────────────────────────────

export const get = <T>(path: string, init?: RequestOptions) =>
    request<T>(path, { method: "GET", ...init });

export const post = <T>(path: string, body?: unknown, init?: RequestOptions) =>
    request<T>(path, { method: "POST", body, ...init });

export const patch = <T>(path: string, body?: unknown, init?: RequestOptions) =>
    request<T>(path, { method: "PATCH", body, ...init });

export const del = <T>(path: string, init?: RequestOptions) =>
    request<T>(path, { method: "DELETE", ...init });
