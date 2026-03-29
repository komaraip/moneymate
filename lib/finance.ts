export const cashAccountTypes = [
  "BANK_ACCOUNT",
  "EWALLET_ACCOUNT",
  "CREDIT_ACCOUNT",
  "INVESTMENT_CASH_ACCOUNT",
  "MANUAL_CASH_ACCOUNT"
] as const;

export const bankInstitutionPresets = [
  "BCA",
  "BRI",
  "Mandiri",
  "BNI",
  "CIMB Niaga",
  "Jago",
  "SeaBank",
  "Permata",
  "OCBC",
  "Maybank",
  "Danamon",
  "GoPay",
  "OVO",
  "DANA",
  "ShopeePay"
] as const;

export const regularAccountSubtypePresets = [
  "savings",
  "checking",
  "payroll",
  "digital_bank",
  "e_wallet",
  "cash_wallet"
] as const;

export const investmentAccountRolePresets = [
  "trading_cash",
  "settlement_cash",
  "dividend_receiving_account",
  "linked_rdn",
  "temporary_funding_account"
] as const;

export type CashAccountType = (typeof cashAccountTypes)[number];

export const manualTransactionTypes = ["income", "expense", "transfer", "adjustment"] as const;

export type ManualTransactionType = (typeof manualTransactionTypes)[number];

const accountTypeLabels: Record<string, string> = {
  BANK_ACCOUNT: "Bank Account",
  EWALLET_ACCOUNT: "E-Wallet",
  CREDIT_ACCOUNT: "Credit Account",
  INVESTMENT_CASH_ACCOUNT: "Investment Cash",
  BROKERAGE_ACCOUNT: "Brokerage Account",
  MANUAL_CASH_ACCOUNT: "Manual Cash"
};

const transactionTypeLabels: Record<ManualTransactionType, string> = {
  income: "Income",
  expense: "Expense",
  transfer: "Transfer",
  adjustment: "Adjustment"
};

export function isCashAccountType(type: string) {
  return cashAccountTypes.includes(type as CashAccountType);
}

export function getAccountTypeLabel(type: string) {
  return accountTypeLabels[type] ?? type.replaceAll("_", " ");
}

export function getManualTransactionTypeLabel(type: string) {
  return transactionTypeLabels[type as ManualTransactionType] ?? type;
}

export function getDirectionForTransactionType(type: ManualTransactionType) {
  if (type === "income") return "in";
  if (type === "expense") return "out";
  if (type === "transfer") return "transfer";
  return "neutral";
}

export function isInvestmentCashAccountType(type: string | null | undefined) {
  return type === "INVESTMENT_CASH_ACCOUNT";
}

export function getCategoryTypeForTransactionType(type: ManualTransactionType) {
  if (type === "income") return "INCOME";
  if (type === "expense") return "EXPENSE";
  if (type === "transfer") return "TRANSFER";
  return "ADJUSTMENT";
}

export function maskAccountNumber(accountNumber: string) {
  const normalized = accountNumber.replace(/\s+/g, "");
  if (normalized.length <= 4) {
    return normalized;
  }

  return `**** ${normalized.slice(-4)}`;
}
