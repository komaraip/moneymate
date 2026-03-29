import { AuditActionType } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { applySessionCookie, issueSession } from "@/lib/auth/session";
import { createAuditEvent } from "@/lib/audit/service";
import { loginSchema } from "@/lib/validation/auth";
import { AppError } from "@/lib/utils/errors";
import { jsonError } from "@/lib/utils/http";

export async function POST(request: Request) {
  try {
    const payload = loginSchema.parse(await request.json());
    const user = await prisma.user.findUnique({
      where: {
        email: payload.email
      }
    });

    if (!user) {
      throw new AppError("Invalid credentials.", 401, "invalid_credentials");
    }

    const isValid = await verifyPassword(payload.password, user.passwordHash);
    if (!isValid) {
      throw new AppError("Invalid credentials.", 401, "invalid_credentials");
    }

    const { token } = await issueSession(user.id);
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName
      }
    });

    await createAuditEvent({
      userId: user.id,
      entityType: "session",
      entityId: user.id,
      actionType: AuditActionType.LOGIN
    });

    return applySessionCookie(response, token);
  } catch (error) {
    return jsonError(error);
  }
}
