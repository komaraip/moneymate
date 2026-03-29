import { requireApiUser } from "@/lib/auth/session";
import { rejectDocument } from "@/lib/services/documents";
import { jsonError, jsonOk } from "@/lib/utils/http";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    return jsonOk(await rejectDocument(user.id, id));
  } catch (error) {
    return jsonError(error);
  }
}

