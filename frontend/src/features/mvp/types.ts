import type { components } from "../../lib/generated/openapi";

type Schemas = components["schemas"];

export type Overview = Schemas["DashboardOverview"];
export type AllocationItem = Schemas["AssetAllocation"];
export type AlertItem = Schemas["Alert"];
export type Holding = Schemas["Holding"];
export type Instrument = Schemas["Instrument"];
export type Transaction = Schemas["Transaction"];
export type CashAccount = Schemas["CashAccount"];
export type AssetCategory = Schemas["AssetCategory"];
export type AuditLog = Schemas["AuditLog"];
export type ImportPreviewRow = Schemas["ImportPreviewRow"];
export type ImportPreview = Schemas["ImportPreview"];
export type ImportPreviewSummary = ImportPreview["summary"];
export type ImportConfirmResult = NonNullable<Schemas["ImportConfirmEnvelope"]["data"]>;
export type MonthlySummaryReport = Schemas["MonthlySummaryReport"];
export type PortfolioPerformanceReport = Schemas["PortfolioPerformanceReport"];
export type ReportWarning = Schemas["ReportWarning"];
