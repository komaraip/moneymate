import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, FileSpreadsheet, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { queryKeys } from "../../utils/query-keys";
import { moneymateApi } from "../../helpers/moneymate-api";
import { Card } from "../../components/ui/Card";
import { PageHeader } from "../../components/ui/PageHeader";
import type { ImportConfirmResult, ImportPreview, ImportPreviewRow } from "../../types/moneymate";

const sectionLabels: Record<ImportPreviewRow["section"], string> = {
  holdings: "Portofolio",
  orders: "Transaksi",
  asset_summary: "Ringkasan Aset",
  cash: "Kas",
};

export function ImportPage() {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [result, setResult] = useState<ImportConfirmResult | null>(null);

  const uploadImport = useMutation({
    mutationFn: () => {
      if (!file) {
        throw new Error("Pilih file CSV atau XLSX terlebih dahulu.");
      }
      return moneymateApi.uploadImport(file);
    },
    onSuccess: (data) => {
      setPreview(data);
      setResult(null);
    },
  });

  const confirmImport = useMutation({
    mutationFn: () => {
      if (!preview?.job_id) {
        throw new Error("Pratinjau impor belum tersedia.");
      }
      return moneymateApi.confirmImport(preview.job_id);
    },
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.overview });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.allocation });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.performance });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.alerts });
      queryClient.invalidateQueries({ queryKey: queryKeys.holdings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.cashAccounts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.instruments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.auditLogs.all });
    },
  });

  const validRows = preview?.summary.valid_rows ?? 0;
  const invalidRows = preview?.summary.invalid_rows ?? 0;
  const canConfirm = Boolean(preview?.job_id) && validRows > 0 && !result;
  const uploadError = errorMessage(uploadImport.error);
  const confirmError = errorMessage(confirmImport.error);

  const detectedSections = useMemo(() => {
    if (!preview?.detected_sections?.length) {
      return [];
    }
    return preview.detected_sections.map((section) => sectionLabels[section] ?? section);
  }, [preview]);

  return (
    <div>
      <PageHeader description="Unggah CSV/XLSX dari tracker lama" title="Impor Spreadsheet" />

      <Card className="mb-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 flex-1">
            <label className="mb-2 block text-sm font-medium text-zinc-200" htmlFor="import-file">
              File Impor
            </label>
            <input
              accept=".csv,.xlsx"
              className="block w-full rounded-lg border border-subtle bg-app px-3 py-2 text-sm text-zinc-200 file:mr-4 file:rounded-md file:border-0 file:bg-surface-hover file:px-3 file:py-1.5 file:text-sm file:text-main"
              id="import-file"
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null);
                setResult(null);
              }}
              type="file"
            />
            <p className="mt-2 text-xs text-muted">
              Data harga dari import tetap manual dan bukan real-time.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-400 px-4 py-2 text-sm font-medium text-zinc-950 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!file || uploadImport.isPending}
              onClick={() => uploadImport.mutate()}
              type="button"
            >
              <Upload className="h-4 w-4" />
              {uploadImport.isPending ? "Memproses..." : "Pratinjau"}
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-subtle px-4 py-2 text-sm font-medium text-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!canConfirm || confirmImport.isPending}
              onClick={() => confirmImport.mutate()}
              type="button"
            >
              <CheckCircle2 className="h-4 w-4" />
              {confirmImport.isPending ? "Mengimpor..." : "Konfirmasi Impor"}
            </button>
          </div>
        </div>

        {uploadError ? <Alert message={uploadError} /> : null}
        {confirmError ? <Alert message={confirmError} /> : null}
        {result ? <Success result={result} /> : null}
      </Card>

      {preview ? (
        <>
          <div className="mb-5 grid gap-4 md:grid-cols-4">
            <SummaryCard label="Total Baris" value={preview.summary.total_rows} />
            <SummaryCard label="Valid" value={validRows} />
            <SummaryCard label="Bermasalah" value={invalidRows} />
            <SummaryCard label="Bagian" value={detectedSections.length} />
          </div>

          <Card className="mb-5">
            <div className="flex flex-wrap gap-2">
              {detectedSections.map((section) => (
                <span className="rounded-full border border-subtle px-3 py-1 text-xs text-muted" key={section}>
                  {section}
                </span>
              ))}
            </div>
          </Card>

          <PreviewTable rows={preview.rows} />
        </>
      ) : (
        <Card>
          <div className="flex items-center gap-3 text-muted">
            <FileSpreadsheet className="h-5 w-5 text-muted" />
            <p className="text-sm">Belum ada pratinjau impor.</p>
          </div>
        </Card>
      )}
    </div>
  );
}

function PreviewTable({ rows }: { rows: ImportPreviewRow[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-subtle">
      <table className="w-full min-w-[980px] text-sm">
        <thead className="bg-surface text-muted">
          <tr>
            {["Baris", "Bagian", "Status", "Data Normalisasi", "Masalah"].map((header) => (
              <th className="px-4 py-3 text-left" key={header}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-subtle">
          {rows.map((row) => (
            <tr className="align-top" key={row.id || `${row.section}-${row.row_number}`}>
              <td className="px-4 py-3 text-muted">{row.row_number}</td>
              <td className="px-4 py-3">{sectionLabels[row.section] ?? row.section}</td>
              <td className="px-4 py-3">
                <StatusBadge status={row.status} />
              </td>
              <td className="px-4 py-3">
                <KeyValueList values={row.normalized} />
              </td>
              <td className="px-4 py-3">
                {row.errors.length > 0 ? (
                  <ul className="space-y-1 text-xs text-amber-200">
                    {row.errors.map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-xs text-muted">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: ImportPreviewRow["status"] }) {
  const styles: Record<ImportPreviewRow["status"], string> = {
    valid: "border-emerald-500/40 bg-success/10 text-emerald-200",
    invalid: "border-amber-500/40 bg-amber-500/10 text-amber-200",
    imported: "border-sky-500/40 bg-sky-500/10 text-sky-200",
    skipped: "border-zinc-600 bg-surface-hover text-muted",
  };
  const labels: Record<ImportPreviewRow["status"], string> = {
    valid: "Valid",
    invalid: "Bermasalah",
    imported: "Diimpor",
    skipped: "Dilewati",
  };
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function KeyValueList({ values }: { values: ImportPreviewRow["normalized"] }) {
  const entries = Object.entries(values).filter(([, value]) => value !== "" && value !== null && value !== undefined);
  if (entries.length === 0) {
    return <span className="text-xs text-muted">-</span>;
  }
  return (
    <div className="grid gap-1 text-xs text-muted md:grid-cols-2">
      {entries.map(([key, value]) => (
        <div className="min-w-0" key={key}>
          <span className="text-muted">{key}: </span>
          <span className="break-words">{String(value)}</span>
        </div>
      ))}
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-main">{value}</p>
    </Card>
  );
}

function Alert({ message }: { message: string }) {
  return (
    <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function Success({ result }: { result: ImportConfirmResult }) {
  const status = result.status === "partial" ? "selesai sebagian" : "selesai";
  const recalculation = result.holdings_recalculated
    ? `Nilai portfolio dihitung ulang untuk ${result.holdings_count} holding pada snapshot ${result.holdings_snapshot_date}.`
    : "Nilai portfolio belum dihitung ulang otomatis.";
  return (
    <div className="mt-4 rounded-lg border border-emerald-500/30 bg-success/10 px-3 py-2 text-sm text-emerald-100">
      Import {status}. Diimpor: {result.imported_rows}, dilewati: {result.skipped_rows}, baris error: {result.failed_rows}. {result.message} {recalculation}
    </div>
  );
}

function errorMessage(error: unknown) {
  if (!error) {
    return "";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Request gagal diproses.";
}
