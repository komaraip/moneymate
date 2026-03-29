import { requireApiUser } from "@/lib/auth/session";
import { getDocumentDetail } from "@/lib/services/documents";
import { AppError } from "@/lib/utils/errors";
import { jsonError, jsonOk } from "@/lib/utils/http";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const detail = await getDocumentDetail(user.id, id);
    if (!detail) {
      throw new AppError("Document not found.", 404, "document_not_found");
    }
    return jsonOk(detail);
  } catch (error) {
    return jsonError(error);
  }
}

