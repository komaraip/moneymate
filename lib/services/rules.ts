export type RuleMatchMode = "CONTAINS" | "EXACT" | "REGEX";

export type ClassificationRuleActionType =
  | "INCLUDE_IN_GENERAL_CASHFLOW"
  | "EXCLUDE_FROM_GENERAL_CASHFLOW"
  | "FORCE_TRANSACTION_TYPE"
  | "FORCE_CATEGORY_NAME";

export type ClassificationRuleScope = "CASHFLOW" | "INGESTION";

type BaseRule = {
  id: string;
  pattern: string;
  matchMode: RuleMatchMode;
  priority: number;
  createdAt: Date;
  isActive: boolean;
};

export type ClassificationRuleForEvaluation = BaseRule & {
  scope: ClassificationRuleScope;
  actionType: ClassificationRuleActionType;
  actionValue: string | null;
};

export type TransferRuleForEvaluation = BaseRule & {
  accountPattern: string | null;
  accountMatchMode: RuleMatchMode;
  counterpartyPattern: string | null;
  counterpartyMatchMode: RuleMatchMode;
  excludeAsInternalTransfer: boolean;
};

export type DocumentMappingRuleForEvaluation = BaseRule & {
  brokerId: string | null;
  investmentAccountId: string | null;
  categoryId: string | null;
};

export type ClassificationRuleContext = {
  text: string;
  scope: ClassificationRuleScope;
};

export type TransferRuleContext = {
  text: string;
  accountName: string | null;
  counterpartyName: string | null;
};

export function normalizeMatchValue(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function compileRegex(pattern: string) {
  try {
    return new RegExp(pattern, "i");
  } catch {
    return null;
  }
}

export function matchPattern(value: string, pattern: string, mode: RuleMatchMode) {
  const normalizedValue = normalizeMatchValue(value);
  const normalizedPattern = normalizeMatchValue(pattern);
  if (!normalizedPattern) {
    return false;
  }

  if (mode === "EXACT") {
    return normalizedValue === normalizedPattern;
  }

  if (mode === "REGEX") {
    const regex = compileRegex(pattern);
    return regex ? regex.test(value) : false;
  }

  return normalizedValue.includes(normalizedPattern);
}

export function buildRuleSearchText(parts: Array<string | null | undefined>) {
  return parts.filter((part): part is string => typeof part === "string" && part.trim().length > 0).join(" ");
}

export function orderActiveRules<T extends BaseRule>(rules: T[]) {
  return rules
    .filter((rule) => rule.isActive)
    .slice()
    .sort((left, right) => {
      if (left.priority !== right.priority) {
        return left.priority - right.priority;
      }

      return left.createdAt.getTime() - right.createdAt.getTime();
    });
}

export function findMatchingClassificationRule(
  rules: ClassificationRuleForEvaluation[],
  context: ClassificationRuleContext
) {
  for (const rule of orderActiveRules(rules)) {
    if (rule.scope !== context.scope) {
      continue;
    }

    if (matchPattern(context.text, rule.pattern, rule.matchMode)) {
      return rule;
    }
  }

  return null;
}

export function findMatchingTransferRule(rules: TransferRuleForEvaluation[], context: TransferRuleContext) {
  for (const rule of orderActiveRules(rules)) {
    const baseMatch = matchPattern(context.text, rule.pattern, rule.matchMode);
    if (!baseMatch) {
      continue;
    }

    if (
      rule.accountPattern &&
      !matchPattern(context.accountName ?? "", rule.accountPattern, rule.accountMatchMode)
    ) {
      continue;
    }

    if (
      rule.counterpartyPattern &&
      !matchPattern(context.counterpartyName ?? "", rule.counterpartyPattern, rule.counterpartyMatchMode)
    ) {
      continue;
    }

    return rule;
  }

  return null;
}

export function findMatchingDocumentMappingRule(
  rules: DocumentMappingRuleForEvaluation[],
  inputText: string
) {
  for (const rule of orderActiveRules(rules)) {
    if (matchPattern(inputText, rule.pattern, rule.matchMode)) {
      return rule;
    }
  }

  return null;
}
