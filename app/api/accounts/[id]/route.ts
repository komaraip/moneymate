import { requireApiUser } from "@/lib/auth/session";
import { getAccountDetail, updateAccount } from "@/lib/services/accounts";
import { AppError } from "@/lib/utils/errors";
import { jsonError, jsonOk } from "@/lib/utils/http";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const detail = await getAccountDetail(user.id, id);

    if (!detail) {
      throw new AppError("Account not found.", 404, "account_not_found");
    }

    return jsonOk(detail);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    return jsonOk(await updateAccount(user.id, id, await request.json()));
  } catch (error) {
    return jsonError(error);
  }
}
