import { redirect } from "next/navigation";
import { getOptionalSession } from "@/lib/auth/session";

export default async function HomePage() {
  const session = await getOptionalSession({
    suppressDatabaseUnavailableErrors: true
  });
  redirect(session ? "/app/dashboard" : "/login");
}
