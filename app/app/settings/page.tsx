import { BrokersSettings } from "@/components/settings/brokers-settings";
import { CashflowPreferencesSettings } from "@/components/settings/cashflow-preferences-settings";
import { InvestmentCategoriesSettings } from "@/components/settings/investment-categories-settings";
import { Card, CardContent, CardHeader } from "@/components/shared/card";
import { PageHeader } from "@/components/shared/page-header";
import { requireUser } from "@/lib/auth/session";
import { getReportPreference, listBrokers, listInvestmentCategories } from "@/lib/services/settings";

export default async function SettingsPage() {
  const user = await requireUser();
  const [rawInvestmentCategories, rawBrokers, rawReportPreference] = await Promise.all([
    listInvestmentCategories(user.id),
    listBrokers(user.id),
    getReportPreference(user.id)
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
    includeInvestmentCashInTotalCash: rawReportPreference.includeInvestmentCashInTotalCash
  };

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
            Choose combined or separate cashflow mode and control dividend/sale/fee inclusion behavior.
          </p>
        </CardHeader>
        <CardContent>
          <CashflowPreferencesSettings preference={reportPreference} />
        </CardContent>
      </Card>
    </div>
  );
}
