import { requireApiUser } from "@/lib/auth/session";
import { createAccount, listAccounts } from "@/lib/services/accounts";
import { jsonError, jsonOk } from "@/lib/utils/http";

export async function GET(request: Request) {
  try {
    const user = await requireApiUser();
    const { searchParams } = new URL(request.url);

    return jsonOk(
      await listAccounts(user.id, {
        accountType: searchParams.get("accountType") ?? undefined,
        includeInactive: searchParams.get("includeInactive") ?? undefined,
        search: searchParams.get("search") ?? undefined
      })
    );
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    return jsonOk(await createAccount(user.id, await request.json()));
  } catch (error) {
    return jsonError(error);
  }
}
