import { AuditActionType } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { applySessionCookie, issueSession } from "@/lib/auth/session";
import { createAuditEvent } from "@/lib/audit/service";
import { registerSchema } from "@/lib/validation/auth";
import { AppError } from "@/lib/utils/errors";
import { jsonError } from "@/lib/utils/http";

export async function POST(request: Request) {
  try {
    const payload = registerSchema.parse(await request.json());

    const existing = await prisma.user.findUnique({
      where: {
        email: payload.email
      }
    });

    if (existing) {
      throw new AppError("An account with that email already exists.", 409, "email_taken");
    }

    const user = await prisma.user.create({
      data: {
        email: payload.email,
        passwordHash: await hashPassword(payload.password),
        displayName: payload.displayName ?? null
      }
    });

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
      entityType: "user",
      entityId: user.id,
      actionType: AuditActionType.CREATE
    });

    return applySessionCookie(response, token);
  } catch (error) {
    return jsonError(error);
  }
}
