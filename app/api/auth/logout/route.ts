import { AuditActionType } from "@prisma/client";
import { NextResponse } from "next/server";
import { clearSessionCookie, getOptionalSession, revokeCurrentSession } from "@/lib/auth/session";
import { createAuditEvent } from "@/lib/audit/service";
import { isDatabaseUnavailableError } from "@/lib/utils/errors";
import { jsonError } from "@/lib/utils/http";

async function handleLogout() {
  const session = await getOptionalSession({
    suppressDatabaseUnavailableErrors: true
  });

  try {
    await revokeCurrentSession();
  } catch (error) {
    if (!isDatabaseUnavailableError(error)) {
      throw error;
    }
  }

  if (session) {
    try {
      await createAuditEvent({
        userId: session.user.id,
        entityType: "session",
        entityId: session.id,
        actionType: AuditActionType.LOGOUT
      });
    } catch (error) {
      if (!isDatabaseUnavailableError(error)) {
        throw error;
      }
    }
  }

  const response = NextResponse.json({
    success: true
  });
  return clearSessionCookie(response);
}

export async function POST() {
  try {
    return await handleLogout();
  } catch (error) {
    return jsonError(error);
  }
}

export async function GET() {
  try {
    return await handleLogout();
  } catch (error) {
    return jsonError(error);
  }
}
