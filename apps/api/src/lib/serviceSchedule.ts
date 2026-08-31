export const DEFAULT_SERVICE_INTERVAL_KM = 5000;

export function computeNextServiceKm(
    lastServiceKm: number | null | undefined,
    serviceIntervalKm: number | null | undefined,
): number | null {
    if (lastServiceKm == null) return null;
    const interval = serviceIntervalKm ?? DEFAULT_SERVICE_INTERVAL_KM;
    return lastServiceKm + interval;
}