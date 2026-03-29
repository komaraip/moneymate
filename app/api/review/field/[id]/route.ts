import { requireApiUser } from "@/lib/auth/session";
import { updateReviewField } from "@/lib/services/review";
import { jsonError, jsonOk } from "@/lib/utils/http";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireApiUser();
    const payload = await request.json();
    const { id } = await params;
    return jsonOk(await updateReviewField(user.id, id, payload));
  } catch (error) {
    return jsonError(error);
  }
}

