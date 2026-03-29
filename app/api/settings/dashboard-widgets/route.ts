import { requireApiUser } from "@/lib/auth/session";
import { listDashboardWidgetPreferences, updateDashboardWidgets } from "@/lib/services/settings";
import { jsonError, jsonOk } from "@/lib/utils/http";

export async function GET() {
  try {
    const user = await requireApiUser();
    return jsonOk(await listDashboardWidgetPreferences(user.id));
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireApiUser();
    return jsonOk(await updateDashboardWidgets(user.id, await request.json()));
  } catch (error) {
    return jsonError(error);
  }
}
