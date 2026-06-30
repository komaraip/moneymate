export type Overview = {
  base_currency: string;
  total_net_worth: number;
  total_portfolio_value: number;
  total_cash: number;
  total_cost: number;
  profit_loss_value: number;
  profit_loss_percent: number;
  price_disclaimer: string;
  financial_disclaimer: string;
};

export type AllocationItem = {
  asset: string;
  value: number;
  percent: number;
};

export type AlertItem = {
  code: string;
  title: string;
  message: string;
  severity: string;
};

export type Holding = {
  id: string;
  instrument_id: string;
  instrument_type: string;
  ticker?: string;
  name: string;
  average_price: number;
  current_price: number;
  units: number;
  total_cost: number;
  current_value: number;
  profit_loss_value: number;
  profit_loss_percent: number;
  warnings?: string[];
};

export type Instrument = {
  id: string;
  type: string;
  ticker?: string;
  name: string;
  provider?: string;
  currency: string;
  is_active: boolean;
};

export type Transaction = {
  id: string;
  instrument_id?: string;
  instrument_name?: string;
  instrument_ticker?: string;
  transaction_date: string;
  type: string;
  price: number;
  units: number;
  net_value: number;
  currency: string;
  fx_rate_to_idr?: number;
  warnings?: string[];
};

export type CashAccount = {
  id: string;
  account_name: string;
  account_type: string;
  currency: string;
  balance: number;
  is_active: boolean;
};

export type AuditLog = {
  id: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  created_at: string;
  ip_address?: string;
};

export type ImportPreviewSummary = {
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
};

export type ImportPreviewRow = {
  id: string;
  section: "holdings" | "orders" | "asset_summary" | "cash";
  row_number: number;
  status: "valid" | "invalid" | "imported" | "skipped";
  raw: Record<string, string>;
  normalized: Record<string, string | number | boolean | null>;
  errors: string[];
};

export type ImportPreview = {
  job_id: string;
  source_type: string;
  original_filename: string;
  detected_sections: ImportPreviewRow["section"][];
  rows: ImportPreviewRow[];
  summary: ImportPreviewSummary;
};

export type ImportConfirmResult = {
  job_id: string;
  status: string;
  total_rows: number;
  imported_rows: number;
  skipped_rows: number;
  failed_rows: number;
  message: string;
};
