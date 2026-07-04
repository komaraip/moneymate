import { apiClient } from "../../lib/api";
import type {
  AlertItem,
  AllocationItem,
  AuditLog,
  AssetCategory,
  CashAccount,
  CashAdjustment,
  Holding,
  ImportConfirmResult,
  ImportPreview,
  Instrument,
  MonthlySummaryReport,
  Overview,
  PortfolioPerformanceReport,
  Transaction,
} from "./types";

export const mvpApi = {
  overview: () => apiClient.get<Overview>("/api/v1/dashboard/overview"),
  allocation: () => apiClient.get<AllocationItem[]>("/api/v1/dashboard/asset-allocation"),
  alerts: () => apiClient.get<AlertItem[]>("/api/v1/dashboard/alerts"),
  monthlySummary: (month: string) => apiClient.get<MonthlySummaryReport>(`/api/v1/reports/monthly-summary?month=${encodeURIComponent(month)}`),
  portfolioPerformance: (from: string, to: string) =>
    apiClient.get<PortfolioPerformanceReport>(
      `/api/v1/reports/portfolio-performance?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    ),
  exportReportsCsv: () => apiClient.download("/api/v1/reports/export.csv"),
  holdings: () => apiClient.get<Holding[]>("/api/v1/holdings"),
  recalculateHoldings: () => apiClient.post<{ count: number; message: string }>("/api/v1/holdings/recalculate?date=2026-06-30", {}),
  instruments: () => apiClient.get<Instrument[]>("/api/v1/instruments"),
  createInstrument: (body: unknown) => apiClient.post<Instrument>("/api/v1/instruments", body),
  updateInstrument: (id: string, body: unknown) => apiClient.put<Instrument>(`/api/v1/instruments/${id}`, body),
  deleteInstrument: (id: string) => apiClient.delete<{ status: string }>(`/api/v1/instruments/${id}`),
  assetCategories: () => apiClient.get<AssetCategory[]>("/api/v1/asset-categories"),
  transactions: () => apiClient.get<Transaction[]>("/api/v1/transactions"),
  createTransaction: (body: unknown) => apiClient.post<Transaction>("/api/v1/transactions", body),
  updateTransaction: (id: string, body: unknown) => apiClient.put<Transaction>(`/api/v1/transactions/${id}`, body),
  deleteTransaction: (id: string) => apiClient.delete<{ status: string }>(`/api/v1/transactions/${id}`),
  cashAccounts: () => apiClient.get<CashAccount[]>("/api/v1/cash-accounts"),
  createCashAccount: (body: unknown) => apiClient.post<CashAccount>("/api/v1/cash-accounts", body),
  updateCashAccount: (id: string, body: unknown) => apiClient.put<CashAccount>(`/api/v1/cash-accounts/${id}`, body),
  deleteCashAccount: (id: string) => apiClient.delete<{ status: string }>(`/api/v1/cash-accounts/${id}`),
  cashAdjustments: (id: string) => apiClient.get<CashAdjustment[]>(`/api/v1/cash-accounts/${id}/adjustments`),
  createCashAdjustment: (id: string, body: unknown) => apiClient.post<CashAdjustment>(`/api/v1/cash-accounts/${id}/adjust`, body),
  createManualPrice: (body: unknown) => apiClient.post("/api/v1/prices/manual", body),
  auditLogs: (filters?: { entity_type?: string; action?: string }) => {
    const params = new URLSearchParams();
    if (filters?.entity_type) params.set("entity_type", filters.entity_type);
    if (filters?.action) params.set("action", filters.action);
    const query = params.toString();
    return apiClient.get<AuditLog[]>(`/api/v1/audit-logs${query ? `?${query}` : ""}`);
  },
  uploadImport: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.upload<ImportPreview>("/api/v1/imports/upload", formData);
  },
  confirmImport: (jobId: string) => apiClient.post<ImportConfirmResult>(`/api/v1/imports/jobs/${jobId}/confirm`, {}),
};
