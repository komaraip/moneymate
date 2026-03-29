import { requireApiUser } from "@/lib/auth/session";
import { getSecurityDetail } from "@/lib/services/investments";
import { AppError } from "@/lib/utils/errors";
import { jsonError, jsonOk } from "@/lib/utils/http";

export async function GET(_: Request, { params }: { params: Promise<{ ticker: string }> }) {
  try {
    const user = await requireApiUser();
    const { ticker } = await params;
    const detail = await getSecurityDetail(user.id, ticker);
    if (!detail) {
      throw new AppError("Security not found.", 404, "security_not_found");
    }
    return jsonOk(detail);
  } catch (error) {
    return jsonError(error);
  }
}

