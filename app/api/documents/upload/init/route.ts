import { requireApiUser } from "@/lib/auth/session";
import { createUploadDraft } from "@/lib/services/documents";
import { jsonError, jsonOk } from "@/lib/utils/http";

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const payload = await request.json();
    return jsonOk(await createUploadDraft(user.id, payload));
  } catch (error) {
    return jsonError(error);
  }
}

