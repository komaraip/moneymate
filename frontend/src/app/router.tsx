import { createBrowserRouter, Navigate } from "react-router-dom";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { LoginPlaceholder } from "../features/auth/LoginPlaceholder";
import { ProtectedRoute } from "../features/auth/ProtectedRoute";
import { PlaceholderPage } from "../features/placeholder/PlaceholderPage";

const dashboardChildren = [
  { index: true, element: <PlaceholderPage title="Overview" /> },
  { path: "portfolio", element: <PlaceholderPage title="Portfolio" /> },
  { path: "orders", element: <PlaceholderPage title="Orders" /> },
  { path: "cash", element: <PlaceholderPage title="Cash" /> },
  { path: "instruments", element: <PlaceholderPage title="Instruments" /> },
  { path: "asset-allocation", element: <PlaceholderPage title="Asset Allocation" /> },
  { path: "reports", element: <PlaceholderPage title="Reports" /> },
  { path: "import-data", element: <PlaceholderPage title="Import Data" /> },
  { path: "insights", element: <PlaceholderPage title="Insights" /> },
  { path: "audit-log", element: <PlaceholderPage title="Audit Log" /> },
  { path: "settings", element: <PlaceholderPage title="Settings" /> },
];

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPlaceholder /> },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: dashboardChildren,
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
