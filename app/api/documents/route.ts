import { requireApiUser } from "@/lib/auth/session";
import { finalizeUpload, listDocuments } from "@/lib/services/documents";
import { jsonError, jsonOk } from "@/lib/utils/http";

export async function GET(request: Request) {
  try {
    const user = await requireApiUser();
    const { searchParams } = new URL(request.url);
    return jsonOk(
      await listDocuments(user.id, {
        status: searchParams.get("status") ?? undefined,
        type: searchParams.get("type") ?? undefined,
        search: searchParams.get("search") ?? undefined,
        page: searchParams.get("page") ?? undefined,
        pageSize: searchParams.get("pageSize") ?? undefined
      })
    );
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const payload = await request.json();
    return jsonOk(await finalizeUpload(user.id, payload));
  } catch (error) {
    return jsonError(error);
  }
}

