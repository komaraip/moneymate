import { requireApiUser } from "@/lib/auth/session";
import { getCashflowReport } from "@/lib/services/reporting";
import { jsonError, jsonOk } from "@/lib/utils/http";

export async function GET(request: Request) {
  try {
    const user = await requireApiUser();
    const { searchParams } = new URL(request.url);

    return jsonOk(
      await getCashflowReport(user.id, {
        from: searchParams.get("from") ?? undefined,
        to: searchParams.get("to") ?? undefined,
        mode: searchParams.get("mode") ?? undefined
      })
    );
  } catch (error) {
    return jsonError(error);
  }
}
