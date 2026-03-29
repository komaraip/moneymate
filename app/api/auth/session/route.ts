import { getOptionalSession } from "@/lib/auth/session";
import { jsonError, jsonOk } from "@/lib/utils/http";

export async function GET() {
  try {
    const session = await getOptionalSession({
      suppressDatabaseUnavailableErrors: true
    });
    return jsonOk({
      session
    });
  } catch (error) {
    return jsonError(error);
  }
}
