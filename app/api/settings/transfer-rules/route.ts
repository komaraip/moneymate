import { requireApiUser } from "@/lib/auth/session";
import { createTransferRule, listTransferRules } from "@/lib/services/settings";
import { jsonError, jsonOk } from "@/lib/utils/http";

export async function GET() {
  try {
    const user = await requireApiUser();
    return jsonOk(await listTransferRules(user.id));
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    return jsonOk(await createTransferRule(user.id, await request.json()));
  } catch (error) {
    return jsonError(error);
  }
}
