export type ValidationIssue = {
  message: string;
  severity: "warning" | "error";
  path?: string;
};

export type ParsedAccountMetadata = {
  sid: string | null;
  clientCode: string | null;
  sre: string | null;
  rdn: string | null;
  office: string | null;
  salesperson: string | null;
};

export type ParsedStockActivityRow = {
  rawRowText: string;
  activityDate: string | null;
  settleDate: string | null;
  referenceNumber: string | null;
  description: string;
  activityType: string;
  price: string | null;
  quantity: string | null;
  balanceAfter: string | null;
  averagePriceAfter: string | null;
  marketValueAfter: string | null;
  realizedProfitLoss: string | null;
  confidence: number;
  requiresReview: boolean;
};

export type ParsedSecuritySection = {
  ticker: string;
  securityName: string;
  currency: string;
  rows: ParsedStockActivityRow[];
  totals: {
    sectionTotal: string | null;
  };
};

export type ParsedStockActivityDocument = {
  documentType: "STOCK_ACTIVITY_STATEMENT";
  statementPeriod: {
    start: string | null;
    end: string | null;
  };
  accountMetadata: ParsedAccountMetadata;
  securities: ParsedSecuritySection[];
  validationIssues: ValidationIssue[];
  grandTotals: {
    grandTotal: string | null;
  };
  parserConfidence: number;
};

