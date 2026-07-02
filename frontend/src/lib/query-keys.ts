export const queryKeys = {
  dashboard: {
    overview: ["dashboard", "overview"] as const,
    allocation: ["dashboard", "allocation"] as const,
    performance: ["dashboard", "performance"] as const,
    alerts: ["dashboard", "alerts"] as const,
  },
  reports: {
    monthly: (month: string) => ["reports", "monthly", month] as const,
    performance: (from: string, to: string) => ["reports", "performance", from, to] as const,
  },
  holdings: {
    all: ["holdings"] as const,
  },
  transactions: {
    all: ["transactions"] as const,
  },
  cashAccounts: {
    all: ["cash-accounts"] as const,
  },
  instruments: {
    all: ["instruments"] as const,
  },
  assetCategories: {
    all: ["asset-categories"] as const,
  },
  auditLogs: {
    all: ["audit-logs"] as const,
    filtered: (filters: { entity_type?: string; action?: string }) => ["audit-logs", filters] as const,
  },
  imports: {
    all: ["imports"] as const,
  },
};
