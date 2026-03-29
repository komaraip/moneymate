import { requireApiUser } from "@/lib/auth/session";
import { getApprovedHoldings } from "@/lib/services/investments";
import {
  getCashflowReport,
  getDocumentsExportRows
} from "@/lib/services/reporting";
import { listTransactions } from "@/lib/services/transactions";
import { toCsv } from "@/lib/utils/csv";
import { jsonError } from "@/lib/utils/http";
import { exportReportQuerySchema } from "@/lib/validation/reports";

function createCsvResponse(filename: string, csv: string) {
  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`
    }
  });
}

export async function GET(request: Request) {
  try {
    const user = await requireApiUser();
    const { searchParams } = new URL(request.url);
    const params = exportReportQuerySchema.parse({
      kind: searchParams.get("kind") ?? undefined,
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
      duplicatesOnly: searchParams.get("duplicatesOnly") ?? undefined,
      confidenceBelow: searchParams.get("confidenceBelow") ?? undefined,
      accountId: searchParams.get("accountId") ?? undefined,
      type: searchParams.get("type") ?? undefined,
      search: searchParams.get("search") ?? undefined
    });

    if (params.kind === "cashflow") {
      const report = await getCashflowReport(user.id, {
        from: params.from,
        to: params.to
      });
      return createCsvResponse(
        "cashflow-report.csv",
        toCsv(
          report.monthly.map((row) => ({
            month: row.month,
            income: row.income,
            expense: row.expense,
            net: row.net
          }))
        )
      );
    }

    if (params.kind === "transactions") {
      const report = await listTransactions(user.id, {
        accountId: params.accountId,
        type: params.type,
        search: params.search,
        from: params.from,
        to: params.to,
        page: "1",
        pageSize: "1000"
      });

      return createCsvResponse(
        "transactions-report.csv",
        toCsv(
          report.items.map((row) => ({
            transactionDate: row.transactionDate,
            postingDate: row.postingDate,
            accountName: row.accountName,
            transactionType: row.transactionType,
            direction: row.direction,
            amount: row.amount,
            currency: row.currency,
            categoryName: row.categoryName,
            description: row.description,
            merchantName: row.merchantName,
            counterpartyName: row.counterpartyName,
            reviewStatus: row.reviewStatus,
            sourceDocumentId: row.sourceDocumentId
          }))
        )
      );
    }

    if (params.kind === "documents") {
      const documents = await getDocumentsExportRows(user.id, {
        search: params.search,
        duplicatesOnly: params.duplicatesOnly ? "true" : undefined,
        confidenceBelow: params.confidenceBelow?.toString(),
        page: "1",
        pageSize: "1000"
      });

      return createCsvResponse(
        "documents-report.csv",
        toCsv(
          documents.map((row) => ({
            filename: row.filename,
            documentType: row.documentType,
            parseStatus: row.parseStatus,
            overallConfidence: row.overallConfidence,
            duplicateOfDocumentId: row.duplicateOfDocumentId,
            uploadedAt: row.uploadedAt,
            processedAt: row.processedAt,
            statementStart: row.statementPeriod.start,
            statementEnd: row.statementPeriod.end
          }))
        )
      );
    }

    const holdings = await getApprovedHoldings(user.id);
    return createCsvResponse(
      "holdings-report.csv",
      toCsv(
        holdings.map((row) => ({
          ticker: row.ticker,
          securityName: row.securityName,
          quantity: row.quantity,
          averageCost: row.averageCost,
          marketValue: row.marketValue,
          latestSnapshotDate: row.latestSnapshotDate,
          investmentAccountName: row.investmentAccountName,
          sourceDocumentId: row.sourceDocumentId
        }))
      )
    );
  } catch (error) {
    return jsonError(error);
  }
}
