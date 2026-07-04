import { createBrowserRouter, Navigate } from "react-router-dom";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { LoginPage } from "../features/auth/LoginPage";
import { ProtectedRoute } from "../features/auth/ProtectedRoute";
import { AuditLogPage } from "../features/mvp/pages/AuditLogPage";
import { CashPage } from "../features/mvp/pages/CashPage";
import { HoldingsPage } from "../features/mvp/pages/HoldingsPage";
import { ImportPage } from "../features/mvp/pages/ImportPage";
import { InstrumentsPage } from "../features/mvp/pages/InstrumentsPage";
import { OverviewPage } from "../features/mvp/pages/OverviewPage";
import { ReportsPage } from "../features/mvp/pages/ReportsPage";
import { TransactionsPage } from "../features/mvp/pages/TransactionsPage";

const dashboardChildren = [
  { index: true, element: <OverviewPage /> },
  { path: "portfolio", element: <HoldingsPage /> },
  { path: "orders", element: <TransactionsPage /> },
  { path: "cash", element: <CashPage /> },
  { path: "instruments", element: <InstrumentsPage /> },
  { path: "asset-allocation", element: <Navigate to="/" replace /> },
  { path: "reports", element: <ReportsPage /> },
  { path: "import-data", element: <ImportPage /> },
  { path: "insights", element: <Navigate to="/" replace /> },
  { path: "audit-log", element: <AuditLogPage /> },
  { path: "settings", element: <Navigate to="/" replace /> },
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
