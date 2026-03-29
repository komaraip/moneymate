import { requireApiUser } from "@/lib/auth/session";
import { createAccountSnapshot } from "@/lib/services/accounts";
import { jsonError, jsonOk } from "@/lib/utils/http";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    return jsonOk(await createAccountSnapshot(user.id, id, await request.json()));
  } catch (error) {
    return jsonError(error);
  }
}
