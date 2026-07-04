import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { EmptyState } from "../../../components/feedback/EmptyState";
import { ErrorState } from "../../../components/feedback/ErrorState";
import { LoadingState } from "../../../components/feedback/LoadingState";
import { formatCurrency, formatNumber, formatPercent } from "../../../lib/format";
import { queryKeys } from "../../../lib/query-keys";
import { mvpApi } from "../api";
import { Card } from "../components/Card";
import { PageHeader } from "../components/PageHeader";

export function HoldingsPage() {
  const queryClient = useQueryClient();
  const holdings = useQuery({ queryKey: queryKeys.holdings.all, queryFn: mvpApi.holdings });
  const instruments = useQuery({ queryKey: queryKeys.instruments.all, queryFn: mvpApi.instruments });
  const recalc = useMutation({
    mutationFn: mvpApi.recalculateHoldings,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.holdings.all }),
  });
  const [instrumentId, setInstrumentId] = useState("");
  const [price, setPrice] = useState("");
  const manualPrice = useMutation({
    mutationFn: () =>
      mvpApi.createManualPrice({
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
          <select className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2" onChange={(e) => setInstrumentId(e.target.value)} value={instrumentId}>
            <option value="">Pilih instrumen</option>
            {instruments.data?.map((item) => (
              <option key={item.id} value={item.id}>
                {item.ticker ? `${item.ticker} - ` : ""}{item.name}
              </option>
            ))}
          </select>
          <input className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2" onChange={(e) => setPrice(e.target.value)} placeholder="Harga manual" value={price} />
          <button className="rounded-lg border border-zinc-700 px-4 py-2 text-sm" disabled={!instrumentId || !price || manualPrice.isPending} onClick={() => manualPrice.mutate()} type="button">
            Update Harga Manual
          </button>
          <button className="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-medium text-zinc-950" disabled={recalc.isPending} onClick={() => recalc.mutate()} type="button">
            Hitung Ulang
          </button>
        </div>
      </Card>
      {!holdings.data?.length ? (
        <EmptyState description="Klik Hitung Ulang setelah seed data tersedia." title="Portofolio kosong" />
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-800">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-zinc-900 text-zinc-400">
              <tr>{["Instrumen", "Unit", "Harga Rata-rata", "Harga Terkini", "Nilai", "L/R", "L/R %", "Peringatan"].map((h) => <th className="px-4 py-3 text-left" key={h}>{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {holdings.data.map((item) => (
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
