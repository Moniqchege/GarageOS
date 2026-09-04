// Core fetch helpers
export { request, get, post, patch, del, ApiError } from "./http";

// React hooks
export { useApi, useMutation } from "./hooks";
export type { UseApiState, UseMutationState } from "./hooks";

// Domain resource clients — import the whole namespace or individual fns
export { auth } from "./resources/auth";
export { vehicles } from "./resources/vehicles";
export { customers } from "./resources/customers";
export { jobs } from "./resources/jobs";
export { inventory } from "./resources/inventory";
export { labor } from "./resources/labor";
export { pos } from "./resources/pos";
export { users } from "./resources/users";
export { analytics } from "./resources/analytics";

// Resource-specific payload / response types
export type { LoginResponse, BusinessSettings } from "./resources/auth";
export type { RestockPayload } from "./resources/inventory";
export type { CartLine, Cart, CheckoutPayload, Receipt } from "./resources/pos";
export type { CreateUserPayload, UpdatePinPayload, EmployeeActivityJob } from "./resources/users";
export type {
    AnalyticsSummary,
    JobRevenueEntry,
    JobStageCount,
    InventoryStats,
    StaffStat,
} from "./resources/analytics";
