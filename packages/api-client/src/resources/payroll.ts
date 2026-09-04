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
    /**
     * Fetch the full payroll table for a given month.
     * Returns one PayrollRow per employee with calculated earnings.
     */
    getPeriod: (year: number, month: number) =>
        get<PayrollRow[]>(`/api/payroll?${periodParams(year, month)}`),

    /**
     * Fetch the pay-period summary for a single employee.
     * Used on the employee detail page overview tab.
     */
    getEmployeePeriod: (employeeId: string, year: number, month: number) =>
        get<EmployeePayPeriod>(
            `/api/payroll/${employeeId}?${periodParams(year, month)}`,
        ),

    /**
     * Mark a pay period as paid (or pass paid: false to unmark).
     * Does NOT wire any money — purely a status flag.
     */
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
