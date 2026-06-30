import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ErrorState } from "../../../components/feedback/ErrorState";
import { LoadingState } from "../../../components/feedback/LoadingState";
import { formatCurrency, formatDate, formatNumber } from "../../../lib/format";
import { queryKeys } from "../../../lib/query-keys";
import { mvpApi } from "../api";
import { Card } from "../components/Card";
import { PageHeader } from "../components/PageHeader";

export function TransactionsPage() {
  const queryClient = useQueryClient();
  const transactions = useQuery({ queryKey: queryKeys.transactions.all, queryFn: mvpApi.transactions });
  const instruments = useQuery({ queryKey: queryKeys.instruments.all, queryFn: mvpApi.instruments });
  const [form, setForm] = useState({ instrument_id: "", transaction_date: "2026-06-30", type: "buy", price: "", units: "", currency: "IDR", fx_rate_to_idr: "" });
  const create = useMutation({
    mutationFn: () => mvpApi.createTransaction({ ...form, price: Number(form.price), units: Number(form.units), fx_rate_to_idr: form.currency === "IDR" ? undefined : Number(form.fx_rate_to_idr) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all }),
  });

  if (transactions.isLoading) return <LoadingState />;
  if (transactions.isError) return <ErrorState message="Transaksi belum bisa dimuat." />;

  return (
    <div>
      <PageHeader description="Catat order buy/sell manual" title="Orders" />
      <Card className="mb-4">
        <div className="grid gap-3 md:grid-cols-4">
          <select className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2" onChange={(e) => setForm({ ...form, instrument_id: e.target.value })} value={form.instrument_id}>
            <option value="">Pilih instrumen</option>
            {instruments.data?.map((item) => <option key={item.id} value={item.id}>{item.ticker ?? item.name}</option>)}
          </select>
          <input className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2" onChange={(e) => setForm({ ...form, transaction_date: e.target.value })} type="date" value={form.transaction_date} />
          <input className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2" onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Harga" value={form.price} />
          <input className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2" onChange={(e) => setForm({ ...form, units: e.target.value })} placeholder="Units" value={form.units} />
          <select className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2" onChange={(e) => setForm({ ...form, currency: e.target.value })} value={form.currency}>
            <option>IDR</option><option>USD</option>
          </select>
          {form.currency !== "IDR" ? <input className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2" onChange={(e) => setForm({ ...form, fx_rate_to_idr: e.target.value })} placeholder="FX rate ke IDR" value={form.fx_rate_to_idr} /> : null}
          <button className="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-medium text-zinc-950" disabled={create.isPending} onClick={() => create.mutate()} type="button">Tambah Transaksi</button>
        </div>
      </Card>
      <Table headers={["Tanggal", "Instrument", "Type", "Price", "Units", "Net Value"]}>
        {transactions.data?.map((item) => (
          <tr className="border-t border-zinc-800" key={item.id}>
            <td className="px-4 py-3">{formatDate(item.transaction_date)}</td>
            <td className="px-4 py-3">{item.instrument_ticker ?? item.instrument_name}</td>
            <td className="px-4 py-3">{item.type}</td>
            <td className="px-4 py-3 text-right">{formatCurrency(item.price, item.currency)}</td>
            <td className="px-4 py-3 text-right">{formatNumber(item.units)}</td>
            <td className="px-4 py-3 text-right">{formatCurrency(item.net_value, item.currency)}</td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return <div className="overflow-hidden rounded-xl border border-zinc-800"><table className="w-full min-w-[800px] text-sm"><thead className="bg-zinc-900 text-zinc-400"><tr>{headers.map((h) => <th className="px-4 py-3 text-left" key={h}>{h}</th>)}</tr></thead><tbody>{children}</tbody></table></div>;
}
