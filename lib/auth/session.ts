import crypto from "node:crypto";
import { SessionStatus } from "@prisma/client";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getRuntimeEnv } from "@/lib/env";
import { AppError, isDatabaseUnavailableError } from "@/lib/utils/errors";

export type AppUser = {
  id: string;
  email: string;
  displayName: string | null;
  preferredCurrency: string;
};

export type AppSession = {
  id: string;
  user: AppUser;
  expiresAt: Date;
};

type SessionLookupOptions = {
  suppressDatabaseUnavailableErrors?: boolean;
};

function getSessionCookieName() {
  return getRuntimeEnv().SESSION_COOKIE_NAME;
}

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function issueSession(userId: string) {
  const env = getRuntimeEnv();
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + env.SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
  const requestHeaders = await headers();
  const { prisma } = await import("@/lib/db/prisma");

  const session = await prisma.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
      ipAddress: requestHeaders.get("x-forwarded-for") ?? undefined,
      userAgent: requestHeaders.get("user-agent") ?? undefined
    }
  });

  return {
    token,
    session
  };
}

export function applySessionCookie(response: Response, token: string) {
  const env = getRuntimeEnv();
  const secure = env.APP_URL.startsWith("https://") ? "; Secure" : "";
  response.headers.append(
    "Set-Cookie",
    `${env.SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${env.SESSION_TTL_DAYS * 24 * 60 * 60}${secure}`
  );
  return response;
}

export function clearSessionCookie(response: Response) {
  const secure = getRuntimeEnv().APP_URL.startsWith("https://") ? "; Secure" : "";
  response.headers.append(
    "Set-Cookie",
    `${getSessionCookieName()}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`
  );
  return response;
}

async function loadSessionByToken(rawToken: string, options: SessionLookupOptions = {}) {
  const tokenHash = hashToken(rawToken);
  const { prisma } = await import("@/lib/db/prisma");
  let session;

  try {
    session = await prisma.session.findUnique({
      where: {
        tokenHash
      },
      include: {
        user: true
      }
    });
  } catch (error) {
    if (options.suppressDatabaseUnavailableErrors && isDatabaseUnavailableError(error)) {
      return null;
    }

    throw error;
  }

  if (!session) {
    return null;
  }

  if (session.status !== SessionStatus.ACTIVE || session.expiresAt < new Date()) {
    return null;
  }

  return session;
}

export async function getOptionalSession(options: SessionLookupOptions = {}): Promise<AppSession | null> {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(getSessionCookieName())?.value;
  if (!rawToken) {
    return null;
  }

  const session = await loadSessionByToken(rawToken, options);
  if (!session) {
    return null;
  }

  return {
    id: session.id,
    expiresAt: session.expiresAt,
    user: {
      id: session.user.id,
      email: session.user.email,
      displayName: session.user.displayName,
      preferredCurrency: session.user.preferredCurrency
    }
  };
}

export async function requireUser() {
  const session = await getOptionalSession();
  if (!session) {
    redirect("/login");
  }

  return session.user;
}

export async function requireApiUser() {
  const session = await getOptionalSession();
  if (!session) {
    throw new AppError("Authentication required.", 401, "unauthorized");
  }

  return session.user;
}

export async function revokeCurrentSession() {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(getSessionCookieName())?.value;
  if (!rawToken) {
    return null;
  }

  const { prisma } = await import("@/lib/db/prisma");
  return prisma.session.updateMany({
    where: {
      tokenHash: hashToken(rawToken)
    },
    data: {
      status: SessionStatus.REVOKED
    }
  });
}
