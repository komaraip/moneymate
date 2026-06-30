import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ErrorState } from "../../../components/feedback/ErrorState";
import { LoadingState } from "../../../components/feedback/LoadingState";
import { queryKeys } from "../../../lib/query-keys";
import { mvpApi } from "../api";
import { Card } from "../components/Card";
import { PageHeader } from "../components/PageHeader";

export function InstrumentsPage() {
  const queryClient = useQueryClient();
  const instruments = useQuery({ queryKey: queryKeys.instruments.all, queryFn: mvpApi.instruments });
  const [form, setForm] = useState({ type: "stock", ticker: "", name: "", currency: "IDR" });
  const create = useMutation({
    mutationFn: () => mvpApi.createInstrument(form),
    onSuccess: () => {
      setForm({ type: "stock", ticker: "", name: "", currency: "IDR" });
      queryClient.invalidateQueries({ queryKey: queryKeys.instruments.all });
    },
  });

  if (instruments.isLoading) return <LoadingState />;
  if (instruments.isError) return <ErrorState message="Instrumen belum bisa dimuat." />;

  return (
    <div>
      <PageHeader description="Master data instrument investasi" title="Instruments" />
      <Card className="mb-4">
        <div className="grid gap-3 md:grid-cols-5">
          <select className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2" onChange={(e) => setForm({ ...form, type: e.target.value })} value={form.type}>
            <option value="stock">Saham</option><option value="etf">ETF</option><option value="mutual_fund">Reksadana</option><option value="gold">Emas</option><option value="cash">Cash</option><option value="other">Other</option>
          </select>
          <input className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2" onChange={(e) => setForm({ ...form, ticker: e.target.value })} placeholder="Ticker" value={form.ticker} />
          <input className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2" onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nama" value={form.name} />
          <select className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2" onChange={(e) => setForm({ ...form, currency: e.target.value })} value={form.currency}><option>IDR</option><option>USD</option></select>
          <button className="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-medium text-zinc-950" disabled={create.isPending} onClick={() => create.mutate()} type="button">Tambah Instrument</button>
        </div>
      </Card>
      <div className="overflow-hidden rounded-xl border border-zinc-800">
        <table className="w-full min-w-[700px] text-sm">
          <thead className="bg-zinc-900 text-zinc-400"><tr>{["Type", "Ticker", "Name", "Currency", "Status"].map((h) => <th className="px-4 py-3 text-left" key={h}>{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-zinc-800">
            {instruments.data?.map((item) => <tr key={item.id}><td className="px-4 py-3">{item.type}</td><td className="px-4 py-3">{item.ticker}</td><td className="px-4 py-3">{item.name}</td><td className="px-4 py-3">{item.currency}</td><td className="px-4 py-3">{item.is_active ? "Aktif" : "Nonaktif"}</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
