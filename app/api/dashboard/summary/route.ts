import { requireApiUser } from "@/lib/auth/session";
import { getDashboardSummary } from "@/lib/services/dashboard";
import { jsonError, jsonOk } from "@/lib/utils/http";

export async function GET() {
  try {
    const user = await requireApiUser();
    return jsonOk(await getDashboardSummary(user.id));
  } catch (error) {
    return jsonError(error);
  }
}
