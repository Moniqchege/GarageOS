import { del, get, patch, post } from "../http";
import type { JobCard, JobCreatePayload, JobDiagnosisFinding, JobLine, JobStage } from "@garage/types";
import type { CheckoutPayload, Receipt } from "./pos";

export const jobs = {
    list: (stage?: JobStage) =>
        get<JobCard[]>(stage ? `/api/jobs?stage=${stage}` : "/api/jobs"),

    get: (id: string) =>
        get<JobCard>(`/api/jobs/${id}`),

    create: (data: JobCreatePayload) =>
        post<JobCard>("/api/jobs", data),

    update: (id: string, data: Partial<JobCard>) =>
        patch<JobCard>(`/api/jobs/${id}`, data),

    setStage: (id: string, stage: JobStage) =>
        patch<JobCard>(`/api/jobs/${id}/stage`, { stage }),

    addLine: (id: string, line: JobLine) =>
        post<JobCard>(`/api/jobs/${id}/lines`, line),

    removeLine: (id: string, lineIdx: number) =>
        del<JobCard>(`/api/jobs/${id}/lines/${lineIdx}`),

    saveDiagnosis: (
        id: string,
        data: { notes?: string; findings?: JobDiagnosisFinding[] },
    ) => patch<JobCard>(`/api/jobs/${id}/diagnosis`, data),

    close: (id: string, payload?: { mileageAtEnd?: number }) =>
        post<JobCard>(`/api/jobs/${id}/close`, payload ?? {}),

    checkout: (id: string, payload: CheckoutPayload) =>
        post<Receipt>(`/api/jobs/${id}/checkout`, payload),

    complete: (id: string, payload: { mileage: number }) =>
        post<JobCard>(`/api/jobs/${id}/close`, { mileageAtEnd: payload.mileage }),
};