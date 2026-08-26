import { createBrowserRouter } from "react-router-dom";
import { CustomerLayout } from "../layouts/CustomerLayout";
import { HomePage } from "../pages/home/HomePage";
import { VehiclePage } from "../pages/vehicle/VehiclePage";
import { BookPage } from "../pages/book/BookPage";
import { AlertsPage } from "../pages/alerts/AlertsPage";
import { ProfilePage } from "../pages/profile/ProfilePage";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <CustomerLayout />,
        children: [
            { index: true, element: <HomePage /> },
            { path: "vehicle", element: <VehiclePage /> },
            { path: "book", element: <BookPage /> },
            { path: "alerts", element: <AlertsPage /> },
            { path: "profile", element: <ProfilePage /> },
        ],
    },
]);
