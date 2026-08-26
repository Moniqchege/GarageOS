import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "./http";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UseApiState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    /** Re-run the fetch manually */
    refetch: () => void;
}

export interface UseMutationState<TResult> {
    loading: boolean;
    error: string | null;
    /** Fire the mutation with an arbitrary payload */
    mutate: (...args: unknown[]) => Promise<TResult | null>;
}

// ─── useApi — data-fetching hook ──────────────────────────────────────────────

/**
 * Runs `fetcher()` on mount (and whenever `deps` change) and manages
 * loading / error / data state.
 *
 * @example
 * const { data: jobs, loading, error, refetch } = useApi(
 *   () => api.jobs.list(),
 *   []
 * );
 */
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

/**
 * Returns a `mutate` function that calls `handler(...args)` and manages
 * loading / error state. Does not affect any cache — call a `refetch` from
 * a companion `useApi` hook after a successful mutation if needed.
 *
 * @example
 * const { mutate: createJob, loading } = useMutation(
 *   (data) => api.jobs.create(data)
 * );
 */
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
