export const queryKeys = {
  dashboard: {
    overview: ["dashboard", "overview"] as const,
    allocation: ["dashboard", "allocation"] as const,
    performance: ["dashboard", "performance"] as const,
    alerts: ["dashboard", "alerts"] as const,
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
  auditLogs: {
    all: ["audit-logs"] as const,
  },
  imports: {
    all: ["imports"] as const,
  },
};
