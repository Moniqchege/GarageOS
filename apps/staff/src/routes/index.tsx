import { createBrowserRouter } from "react-router-dom";
import { StaffLayout } from "../layouts/StaffLayout";
import { DashboardPage } from "../pages/dashboard/DashboardPage";
import { IntakePage } from "../pages/intake/IntakePage";
import { CustomersPage } from "../pages/customers/CustomersPage";
import { StockPage } from "../pages/stock/StockPage";
import { LaborChargesPage } from "../pages/labor/LaborChargesPage";
import { PosPage } from "../pages/pos/PosPage";
import { CheckoutPage } from "../pages/pos/CheckoutPage";
import { ReceiptPage } from "../pages/pos/ReceiptPage";
import { UsersPage } from "../pages/users/UsersPage";
import { AnalyticsPage } from "../pages/analytics/AnalyticsPage";
import { SettingsPage } from "../pages/settings/SettingsPage";
import { JobCardPage } from "../pages/jobs/JobCardPage";
import { DiagnosisPage } from "../pages/jobs/DiagnosisPage";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <StaffLayout />,
        children: [
            { index: true, element: <DashboardPage /> },
            { path: "intake", element: <IntakePage /> },
            { path: "customers", element: <CustomersPage /> },
            { path: "stock", element: <StockPage /> },
            { path: "labor", element: <LaborChargesPage /> },
            { path: "pos", element: <PosPage /> },
            { path: "pos/checkout", element: <CheckoutPage /> },
            { path: "pos/receipt", element: <ReceiptPage /> },
            { path: "users", element: <UsersPage /> },
            { path: "analytics", element: <AnalyticsPage /> },
            { path: "settings", element: <SettingsPage /> },
            { path: "jobs/:jobId", element: <JobCardPage /> },
            { path: "jobs/:jobId/diagnosis", element: <DiagnosisPage /> },
        ],
    },
]);
