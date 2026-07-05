import { createBrowserRouter, Navigate } from "react-router-dom";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { LoginPage } from "../pages/auth/LoginPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { AdminDashboardPage } from "../pages/admin/AdminDashboardPage";
import { AuditLogPage } from "../pages/admin/AuditLogPage";
import { AdminUsersPage } from "../pages/admin/AdminUsersPage";
import { HoldingsPage } from "../pages/assets/HoldingsPage";
import { InstrumentsPage } from "../pages/assets/InstrumentsPage";
import { ImportPage } from "../pages/assets/ImportPage";
import { AccountsPage } from "../pages/money/AccountsPage";
import { BudgetsPage } from "../pages/money/BudgetsPage";
import { SavingsGoalsPage } from "../pages/money/SavingsGoalsPage";
import { TransactionsPage } from "../pages/money/TransactionsPage";
import { OverviewPage } from "../pages/overview/OverviewPage";
import { ReportsPage } from "../pages/reports/ReportsPage";
import { SettingsPage } from "../pages/settings/SettingsPage";

const dashboardChildren = [
  { index: true, element: <OverviewPage /> },
  { path: "transactions", element: <TransactionsPage /> },
  { path: "accounts", element: <AccountsPage /> },
  { path: "budgets", element: <BudgetsPage /> },
  { path: "savings-goals", element: <SavingsGoalsPage /> },
  { path: "reports", element: <ReportsPage /> },
  { path: "assets/portfolio", element: <HoldingsPage /> },
  { path: "assets/instruments", element: <InstrumentsPage /> },
  { path: "imports", element: <ImportPage /> },
  { path: "admin", element: <AdminDashboardPage /> },
  { path: "admin/users", element: <AdminUsersPage /> },
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
