import { BrokersSettings } from "@/components/settings/brokers-settings";
import { CashflowPreferencesSettings } from "@/components/settings/cashflow-preferences-settings";
import { ClassificationRulesSettings } from "@/components/settings/classification-rules-settings";
import { DashboardWidgetsSettings } from "@/components/settings/dashboard-widgets-settings";
import { DocumentMappingRulesSettings } from "@/components/settings/document-mapping-rules-settings";
import { InvestmentCategoriesSettings } from "@/components/settings/investment-categories-settings";
import { TransferRulesSettings } from "@/components/settings/transfer-rules-settings";
import { Card, CardContent, CardHeader } from "@/components/shared/card";
import { PageHeader } from "@/components/shared/page-header";
import { requireUser } from "@/lib/auth/session";
import {
  getDashboardPreference,
  getReportPreference,
  listBrokers,
  listClassificationRules,
  listDashboardWidgetPreferences,
  listDocumentMappingRules,
  listInvestmentAccountsForSettings,
  listInvestmentCategories,
  listTransferRules
} from "@/lib/services/settings";

export default async function SettingsPage() {
  const user = await requireUser();
  const [
    rawInvestmentCategories,
    rawBrokers,
    rawReportPreference,
    rawClassificationRules,
    rawTransferRules,
    rawDocumentMappingRules,
    rawDashboardPreference,
    rawDashboardWidgets,
    rawInvestmentAccounts
  ] = await Promise.all([
    listInvestmentCategories(user.id),
    listBrokers(user.id),
    getReportPreference(user.id),
    listClassificationRules(user.id),
    listTransferRules(user.id),
    listDocumentMappingRules(user.id),
    getDashboardPreference(user.id),
    listDashboardWidgetPreferences(user.id),
    listInvestmentAccountsForSettings(user.id)
  ]);
  const investmentCategories = rawInvestmentCategories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    iconToken: category.iconToken,
    colorToken: category.colorToken,
    isSystemDefault: category.isSystemDefault,
    isActive: category.isActive,
    includeInNetWorth: category.includeInNetWorth,
    includeInDashboard: category.includeInDashboard,
    includeInReports: category.includeInReports,
    sortOrder: category.sortOrder
  }));
  const brokers = rawBrokers.map((broker) => ({
    id: broker.id,
    investmentCategoryId: broker.investmentCategoryId,
    brokerName: broker.brokerName,
    brokerCode: broker.brokerCode,
    legalEntityName: broker.legalEntityName,
    branchName: broker.branchName,
    clientCode: broker.clientCode,
    sid: broker.sid,
    sre: broker.sre,
    rdnAccountId: broker.rdnAccountId,
    defaultCurrency: broker.defaultCurrency,
    country: broker.country,
    isActive: broker.isActive,
    notes: broker.notes
  }));
  const reportPreference = {
    defaultCashflowMode: rawReportPreference.defaultCashflowMode,
    includeDividendsInIncome: rawReportPreference.includeDividendsInIncome,
    includeStockSaleProceedsInIncome: rawReportPreference.includeStockSaleProceedsInIncome,
    includeBrokerFeesInExpenses: rawReportPreference.includeBrokerFeesInExpenses,
    includeInvestmentCashInTotalCash: rawReportPreference.includeInvestmentCashInTotalCash,
    includeRealizedPlInIncome: rawReportPreference.includeRealizedPlInIncome,
    includeUnrealizedPlInDashboard: rawReportPreference.includeUnrealizedPlInDashboard
  };
  const classificationRules = rawClassificationRules.map((rule) => ({
    id: rule.id,
    scope: rule.scope,
    pattern: rule.pattern,
    matchMode: rule.matchMode,
    actionType: rule.actionType,
    actionValue: rule.actionValue,
    priority: rule.priority,
    isActive: rule.isActive,
    createdAt: rule.createdAt.toISOString(),
    updatedAt: rule.updatedAt.toISOString()
  }));
  const transferRules = rawTransferRules.map((rule) => ({
    id: rule.id,
    pattern: rule.pattern,
    matchMode: rule.matchMode,
    accountPattern: rule.accountPattern,
    accountMatchMode: rule.accountMatchMode,
    counterpartyPattern: rule.counterpartyPattern,
    counterpartyMatchMode: rule.counterpartyMatchMode,
    excludeAsInternalTransfer: rule.excludeAsInternalTransfer,
    priority: rule.priority,
    isActive: rule.isActive,
    createdAt: rule.createdAt.toISOString(),
    updatedAt: rule.updatedAt.toISOString()
  }));
  const documentMappingRules = rawDocumentMappingRules.map((rule) => ({
    id: rule.id,
    pattern: rule.pattern,
    matchMode: rule.matchMode,
    brokerId: rule.brokerId,
    brokerName: rule.broker?.brokerName ?? null,
    investmentAccountId: rule.investmentAccountId,
    investmentAccountName: rule.investmentAccount?.displayName ?? rule.investmentAccount?.brokerName ?? null,
    categoryId: rule.categoryId,
    categoryName: rule.category?.name ?? null,
    priority: rule.priority,
    isActive: rule.isActive,
    createdAt: rule.createdAt.toISOString(),
    updatedAt: rule.updatedAt.toISOString()
  }));
  const dashboardPreference = {
    defaultDateRange: rawDashboardPreference.defaultDateRange
  };
  const dashboardWidgets = rawDashboardWidgets.map((widget) => ({
    widgetKey: widget.widgetKey,
    isVisible: widget.isVisible
  }));
  const investmentAccountOptions = rawInvestmentAccounts.map((investmentAccount) => ({
    id: investmentAccount.id,
    label:
      investmentAccount.displayName ||
      investmentAccount.brokerName ||
      investmentAccount.clientCode ||
      investmentAccount.sid ||
      investmentAccount.id
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Configuration"
        title="Settings"
        description="Customize investment categories, broker profiles, and reporting behavior for your financial workflow."
      />

      <Card>
        <CardHeader className="flex-col items-start gap-2">
          <h2 className="text-xl font-semibold">Investment Categories</h2>
          <p className="text-sm text-muted-foreground">
            Define category hierarchy for holdings, net worth inclusion, and reporting visibility.
          </p>
        </CardHeader>
        <CardContent>
          <InvestmentCategoriesSettings categories={investmentCategories} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-col items-start gap-2">
          <h2 className="text-xl font-semibold">Brokers & Securities</h2>
          <p className="text-sm text-muted-foreground">
            Manage broker identities, broker codes, and their default investment category mapping.
          </p>
        </CardHeader>
        <CardContent>
          <BrokersSettings brokers={brokers} categories={investmentCategories} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-col items-start gap-2">
          <h2 className="text-xl font-semibold">Cashflow Preferences</h2>
          <p className="text-sm text-muted-foreground">
            Choose combined or separate cashflow mode and control dividend/sale/fee and realized/unrealized inclusion behavior.
          </p>
        </CardHeader>
        <CardContent>
          <CashflowPreferencesSettings preference={reportPreference} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-col items-start gap-2">
          <h2 className="text-xl font-semibold">Classification Rules</h2>
          <p className="text-sm text-muted-foreground">
            Add pattern-based rules to include/exclude cashflow entries or force transaction/category behavior.
          </p>
        </CardHeader>
        <CardContent>
          <ClassificationRulesSettings rules={classificationRules} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-col items-start gap-2">
          <h2 className="text-xl font-semibold">Transfer Rules</h2>
          <p className="text-sm text-muted-foreground">
            Configure internal transfer detection rules so matching movements are excluded from income/expense analytics.
          </p>
        </CardHeader>
        <CardContent>
          <TransferRulesSettings rules={transferRules} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-col items-start gap-2">
          <h2 className="text-xl font-semibold">Auto-Mapping Rules</h2>
          <p className="text-sm text-muted-foreground">
            Match document patterns to broker/account/category defaults before ingestion assigns ownership.
          </p>
        </CardHeader>
        <CardContent>
          <DocumentMappingRulesSettings
            rules={documentMappingRules}
            brokers={brokers}
            categories={investmentCategories}
            investmentAccounts={investmentAccountOptions}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-col items-start gap-2">
          <h2 className="text-xl font-semibold">Dashboard Widgets</h2>
          <p className="text-sm text-muted-foreground">
            Control which dashboard sections are visible and choose the default date range for dashboard/reports.
          </p>
        </CardHeader>
        <CardContent>
          <DashboardWidgetsSettings preference={dashboardPreference} widgets={dashboardWidgets} />
        </CardContent>
      </Card>
    </div>
  );
}
