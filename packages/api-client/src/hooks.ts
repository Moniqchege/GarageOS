import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "./http";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UseApiState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export interface UseMutationState<TResult> {
    loading: boolean;
    error: string | null;
    mutate: (...args: unknown[]) => Promise<TResult | null>;
}

// ─── useApi — data-fetching hook ──────────────────────────────────────────────
export function useApi<T>(
    fetcher: () => Promise<T>,
    deps: unknown[] = [],
): UseApiState<T> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const fetcherRef = useRef(fetcher);
    fetcherRef.current = fetcher;

    const run = useCallback(() => {
        setLoading(true);
        setError(null);
        fetcherRef
            .current()
            .then((result: T) => {
                setData(result);
                setLoading(false);
            })
            .catch((err: unknown) => {
                setError(err instanceof ApiError ? err.message : String(err));
                setLoading(false);
            });
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
        deps);

    useEffect(() => { run(); }, [run]);

    return { data, loading, error, refetch: run };
}

// ─── useMutation — imperative mutation hook ───────────────────────────────────
export function useMutation<TArgs extends unknown[], TResult>(
    handler: (...args: TArgs) => Promise<TResult>,
): { loading: boolean; error: string | null; mutate: (...args: TArgs) => Promise<TResult | null> } {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const handlerRef = useRef(handler);
    handlerRef.current = handler;

    const mutate = useCallback(async (...args: TArgs): Promise<TResult | null> => {
        setLoading(true);
        setError(null);
        try {
            const result = await handlerRef.current(...args);
            setLoading(false);
            return result;
        } catch (err: unknown) {
            setError(err instanceof ApiError ? err.message : String(err));
            setLoading(false);
            return null;
        }
    }, []);

    return { loading, error, mutate };
}
