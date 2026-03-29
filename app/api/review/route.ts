import { requireApiUser } from "@/lib/auth/session";
import { getReviewQueue } from "@/lib/services/review";
import { jsonError, jsonOk } from "@/lib/utils/http";

export async function GET() {
  try {
    const user = await requireApiUser();
    return jsonOk(await getReviewQueue(user.id));
  } catch (error) {
    return jsonError(error);
  }
}

