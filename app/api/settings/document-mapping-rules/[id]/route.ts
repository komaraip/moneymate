import { requireApiUser } from "@/lib/auth/session";
import { deleteDocumentMappingRule, updateDocumentMappingRule } from "@/lib/services/settings";
import { jsonError, jsonOk } from "@/lib/utils/http";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    return jsonOk(await updateDocumentMappingRule(user.id, id, await request.json()));
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    return jsonOk(await deleteDocumentMappingRule(user.id, id));
  } catch (error) {
    return jsonError(error);
  }
}
