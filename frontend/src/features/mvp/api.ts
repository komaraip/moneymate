import { apiClient } from "../../lib/api";
import type {
  AlertItem,
  AllocationItem,
  AuditLog,
  CashAccount,
  Holding,
  Instrument,
  Overview,
  Transaction,
} from "./types";

export const mvpApi = {
  overview: () => apiClient.get<Overview>("/api/v1/dashboard/overview"),
  allocation: () => apiClient.get<AllocationItem[]>("/api/v1/dashboard/asset-allocation"),
  alerts: () => apiClient.get<AlertItem[]>("/api/v1/dashboard/alerts"),
  holdings: () => apiClient.get<Holding[]>("/api/v1/holdings"),
  recalculateHoldings: () => apiClient.post<{ count: number; message: string }>("/api/v1/holdings/recalculate?date=2026-06-30", {}),
  instruments: () => apiClient.get<Instrument[]>("/api/v1/instruments"),
  createInstrument: (body: unknown) => apiClient.post<Instrument>("/api/v1/instruments", body),
  transactions: () => apiClient.get<Transaction[]>("/api/v1/transactions"),
  createTransaction: (body: unknown) => apiClient.post<Transaction>("/api/v1/transactions", body),
  cashAccounts: () => apiClient.get<CashAccount[]>("/api/v1/cash-accounts"),
  createCashAccount: (body: unknown) => apiClient.post<CashAccount>("/api/v1/cash-accounts", body),
  createManualPrice: (body: unknown) => apiClient.post("/api/v1/prices/manual", body),
  auditLogs: () => apiClient.get<AuditLog[]>("/api/v1/audit-logs"),
};
