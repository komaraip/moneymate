import { requireApiUser } from "@/lib/auth/session";
import { deleteTransaction, updateTransaction } from "@/lib/services/transactions";
import { jsonError, jsonOk } from "@/lib/utils/http";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    return jsonOk(await updateTransaction(user.id, id, await request.json()));
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    return jsonOk(await deleteTransaction(user.id, id));
  } catch (error) {
    return jsonError(error);
  }
}
