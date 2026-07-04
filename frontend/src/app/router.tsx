import { createBrowserRouter, Navigate } from "react-router-dom";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { LoginPage } from "../features/auth/LoginPage";
import { ProtectedRoute } from "../features/auth/ProtectedRoute";
import { AuditLogPage } from "../features/admin/pages/AuditLogPage";
import { HoldingsPage } from "../features/assets/pages/HoldingsPage";
import { InstrumentsPage } from "../features/assets/pages/InstrumentsPage";
import { ImportPage } from "../features/imports/pages/ImportPage";
import { AccountsPage } from "../features/money/pages/AccountsPage";
import { TransactionsPage } from "../features/money/pages/TransactionsPage";
import { OverviewPage } from "../features/overview/pages/OverviewPage";
import { ReportsPage } from "../features/reports/pages/ReportsPage";
import { SettingsPage } from "../features/settings/pages/SettingsPage";

const dashboardChildren = [
  { index: true, element: <OverviewPage /> },
  { path: "transactions", element: <TransactionsPage /> },
  { path: "accounts", element: <AccountsPage /> },
  { path: "reports", element: <ReportsPage /> },
  { path: "assets/portfolio", element: <HoldingsPage /> },
  { path: "assets/instruments", element: <InstrumentsPage /> },
  { path: "imports", element: <ImportPage /> },
  { path: "admin/audit-log", element: <AuditLogPage /> },
  { path: "settings", element: <SettingsPage /> },
  { path: "portfolio", element: <Navigate to="/assets/portfolio" replace /> },
  { path: "orders", element: <Navigate to="/transactions" replace /> },
  { path: "cash", element: <Navigate to="/accounts" replace /> },
  { path: "instruments", element: <Navigate to="/assets/instruments" replace /> },
  { path: "import-data", element: <Navigate to="/imports" replace /> },
  { path: "audit-log", element: <Navigate to="/admin/audit-log" replace /> },
  { path: "asset-allocation", element: <Navigate to="/" replace /> },
  { path: "insights", element: <Navigate to="/" replace /> },
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
