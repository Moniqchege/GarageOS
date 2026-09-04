import { get, patch } from "../http";
import type {
    EmployeePayPeriod,
    MarkPaidResult,
    PayrollRow,
} from "@garage/types";

function periodParams(year: number, month: number): string {
    return `year=${year}&month=${month}`;
}

export const payroll = {
    getPeriod: (year: number, month: number) =>
        get<PayrollRow[]>(`/api/payroll?${periodParams(year, month)}`),

    getEmployeePeriod: (employeeId: string, year: number, month: number) =>
        get<EmployeePayPeriod>(
            `/api/payroll/${employeeId}?${periodParams(year, month)}`,
        ),

    markPaid: (
        employeeId: string,
        year: number,
        month: number,
        paid = true,
    ) =>
        patch<MarkPaidResult>(
            `/api/payroll/${employeeId}/mark-paid?${periodParams(year, month)}`,
            { paid },
        ),
};
