import { requireApiUser } from "@/lib/auth/session";
import { getApprovedHoldings } from "@/lib/services/investments";
import { jsonError, jsonOk } from "@/lib/utils/http";

export async function GET() {
  try {
    const user = await requireApiUser();
    return jsonOk(await getApprovedHoldings(user.id));
  } catch (error) {
    return jsonError(error);
  }
}

