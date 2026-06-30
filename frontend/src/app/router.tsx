import { createBrowserRouter, Navigate } from "react-router-dom";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { LoginPage } from "../features/auth/LoginPage";
import { ProtectedRoute } from "../features/auth/ProtectedRoute";
import { PlaceholderPage } from "../features/placeholder/PlaceholderPage";
import { AuditLogPage } from "../features/mvp/pages/AuditLogPage";
import { CashPage } from "../features/mvp/pages/CashPage";
import { HoldingsPage } from "../features/mvp/pages/HoldingsPage";
import { InstrumentsPage } from "../features/mvp/pages/InstrumentsPage";
import { OverviewPage } from "../features/mvp/pages/OverviewPage";
import { TransactionsPage } from "../features/mvp/pages/TransactionsPage";

const dashboardChildren = [
  { index: true, element: <OverviewPage /> },
  { path: "portfolio", element: <HoldingsPage /> },
  { path: "orders", element: <TransactionsPage /> },
  { path: "cash", element: <CashPage /> },
  { path: "instruments", element: <InstrumentsPage /> },
  { path: "asset-allocation", element: <PlaceholderPage title="Asset Allocation" /> },
  { path: "reports", element: <PlaceholderPage title="Reports" /> },
  { path: "import-data", element: <PlaceholderPage title="Import Data" /> },
  { path: "insights", element: <PlaceholderPage title="Insights" /> },
  { path: "audit-log", element: <AuditLogPage /> },
  { path: "settings", element: <PlaceholderPage title="Settings" /> },
];

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
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
