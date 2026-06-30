import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ErrorState } from "../../../components/feedback/ErrorState";
import { LoadingState } from "../../../components/feedback/LoadingState";
import { formatCurrency } from "../../../lib/format";
import { queryKeys } from "../../../lib/query-keys";
import { mvpApi } from "../api";
import { Card } from "../components/Card";
import { PageHeader } from "../components/PageHeader";

export function CashPage() {
  const queryClient = useQueryClient();
  const cash = useQuery({ queryKey: queryKeys.cashAccounts.all, queryFn: mvpApi.cashAccounts });
  const [accountName, setAccountName] = useState("");
  const [balance, setBalance] = useState("");
  const create = useMutation({
    mutationFn: () => mvpApi.createCashAccount({ account_name: accountName, account_type: "bank", currency: "IDR", balance: Number(balance) }),
    onSuccess: () => {
      setAccountName("");
      setBalance("");
      queryClient.invalidateQueries({ queryKey: queryKeys.cashAccounts.all });
    },
  });

  if (cash.isLoading) return <LoadingState />;
  if (cash.isError) return <ErrorState message="Akun cash belum bisa dimuat." />;

  return (
    <div>
      <PageHeader description="Saldo cash dikelola manual pada MVP" title="Cash" />
      <Card className="mb-4">
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <input className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2" onChange={(e) => setAccountName(e.target.value)} placeholder="Nama akun" value={accountName} />
          <input className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2" onChange={(e) => setBalance(e.target.value)} placeholder="Balance" value={balance} />
          <button className="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-medium text-zinc-950" disabled={create.isPending} onClick={() => create.mutate()} type="button">Tambah Akun Cash</button>
        </div>
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        {cash.data?.map((item) => (
          <Card key={item.id}>
            <p className="text-sm text-zinc-400">{item.account_type}</p>
            <h3 className="mt-1 text-lg font-semibold text-white">{item.account_name}</h3>
            <p className="mt-3 text-2xl font-semibold text-emerald-300">{formatCurrency(item.balance, item.currency)}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
