import { requireApiUser } from "@/lib/auth/session";
import { createClassificationRule, listClassificationRules } from "@/lib/services/settings";
import { jsonError, jsonOk } from "@/lib/utils/http";

export async function GET() {
  try {
    const user = await requireApiUser();
    return jsonOk(await listClassificationRules(user.id));
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    return jsonOk(await createClassificationRule(user.id, await request.json()));
  } catch (error) {
    return jsonError(error);
  }
}
