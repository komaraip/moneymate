import { ActorType, AuditActionType } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

type AuditEventInput = {
  userId?: string | null;
  entityType: string;
  entityId: string;
  actionType: AuditActionType;
  beforeJson?: unknown;
  afterJson?: unknown;
  actorType?: ActorType;
  metadataJson?: unknown;
};

export async function createAuditEvent(input: AuditEventInput) {
  await prisma.auditEvent.create({
    data: {
      userId: input.userId ?? undefined,
      entityType: input.entityType,
      entityId: input.entityId,
      actionType: input.actionType,
      beforeJson: input.beforeJson as never,
      afterJson: input.afterJson as never,
      actorType: input.actorType ?? ActorType.SYSTEM,
      metadataJson: input.metadataJson as never
    }
  });
}

