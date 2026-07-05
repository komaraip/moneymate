import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { LoadingState } from "../../components/feedback/LoadingState";
import { Select } from "../../components/ui/Select";
import { formatCurrency, formatNumber, formatPercent } from "../../utils/format";
import { queryKeys } from "../../utils/query-keys";
import { moneymateApi } from "../../helpers/moneymate-api";
import { Card } from "../../components/ui/Card";
import { PageHeader } from "../../components/ui/PageHeader";
import { motion } from "framer-motion";

export function HoldingsPage() {
  const queryClient = useQueryClient();
  const holdings = useQuery({ queryKey: queryKeys.holdings.all, queryFn: moneymateApi.holdings });
  const instruments = useQuery({ queryKey: queryKeys.instruments.all, queryFn: moneymateApi.instruments });
  const recalc = useMutation({
    mutationFn: moneymateApi.recalculateHoldings,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.holdings.all }),
  });
  const [instrumentId, setInstrumentId] = useState("");
  const [price, setPrice] = useState("");
  const manualPrice = useMutation({
    mutationFn: () =>
      moneymateApi.createManualPrice({
        instrument_id: instrumentId,
        price_date: "2026-06-30",
        price: Number(price),
        currency: instruments.data?.find((item) => item.id === instrumentId)?.currency ?? "IDR",
      }),
    onSuccess: () => {
      setPrice("");
      queryClient.invalidateQueries({ queryKey: queryKeys.holdings.all });
    },
  });

  if (holdings.isLoading) return <LoadingState />;
  if (holdings.isError) return <ErrorState message="Portofolio belum bisa dimuat." />;

  return (
    <div>
      <PageHeader description="Portofolio dihitung backend dengan metode weighted average cost" title="Portofolio" />
      <Card className="mb-4">
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto_auto]">
          <Select
            options={[{ label: "Pilih instrumen", value: "" }, ...(instruments.data?.map((item) => ({ label: item.ticker ? `${item.ticker} - ${item.name}` : item.name, value: item.id })) || [])]}
            value={instrumentId}
            onChange={(val) => setInstrumentId(val)}
          />
          <input className="rounded-lg border border-subtle bg-app px-3 py-2" onChange={(e) => setPrice(e.target.value)} placeholder="Harga manual" value={price} />
          <button className="rounded-lg border border-subtle px-4 py-2 text-sm" disabled={!instrumentId || !price || manualPrice.isPending} onClick={() => manualPrice.mutate()} type="button">
            Update Harga Manual
          </button>
          <button className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-app transition-all hover:bg-primary-hover" disabled={recalc.isPending} onClick={() => recalc.mutate()} type="button">
            Hitung Ulang
          </button>
        </div>
      </Card>
      {!holdings.data?.length ? (
        <EmptyState description="Klik Hitung Ulang setelah seed data tersedia." title="Portofolio kosong" />
      ) : (
        <div className="overflow-hidden rounded-xl border border-subtle">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-surface text-muted">
              <tr>{["Instrument", "Units", "Harga Rata-rata", "Harga Terkini", "Nilai", "L/R", "L/R %", "Peringatan"].map((h) => <th className="text-left p-4 text-[11px] font-semibold text-muted uppercase tracking-[0.08em] font-sans" key={h}>{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-subtle">
              {holdings.data.map((item, index) => (
                <tr key={item.id}>
                  <td className="px-4 py-3">{item.ticker ? `${item.ticker} - ` : ""}{item.name}</td>
                  <td className="px-4 py-3 text-right">{formatNumber(item.units)}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(item.average_price)}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(item.current_price)}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(item.current_value)}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(item.profit_loss_value)}</td>
                  <td className="px-4 py-3 text-right">{formatPercent(item.profit_loss_percent)}</td>
                  <td className="px-4 py-3 text-amber-200">{item.warnings?.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
