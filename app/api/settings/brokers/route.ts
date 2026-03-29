import { requireApiUser } from "@/lib/auth/session";
import { createBroker, listBrokers } from "@/lib/services/settings";
import { jsonError, jsonOk } from "@/lib/utils/http";

export async function GET() {
  try {
    const user = await requireApiUser();
    return jsonOk(await listBrokers(user.id));
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    return jsonOk(await createBroker(user.id, await request.json()));
  } catch (error) {
    return jsonError(error);
  }
}

