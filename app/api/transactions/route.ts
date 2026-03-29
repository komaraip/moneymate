import { requireApiUser } from "@/lib/auth/session";
import { createTransaction, listTransactions } from "@/lib/services/transactions";
import { jsonError, jsonOk } from "@/lib/utils/http";

export async function GET(request: Request) {
  try {
    const user = await requireApiUser();
    const { searchParams } = new URL(request.url);

    return jsonOk(
      await listTransactions(user.id, {
        accountId: searchParams.get("accountId") ?? undefined,
        type: searchParams.get("type") ?? undefined,
        search: searchParams.get("search") ?? undefined,
        from: searchParams.get("from") ?? undefined,
        to: searchParams.get("to") ?? undefined,
        page: searchParams.get("page") ?? undefined,
        pageSize: searchParams.get("pageSize") ?? undefined
      })
    );
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    return jsonOk(await createTransaction(user.id, await request.json()));
  } catch (error) {
    return jsonError(error);
  }
}
