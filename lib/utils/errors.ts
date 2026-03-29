import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

const DATABASE_UNAVAILABLE_MESSAGE =
  "Database is not configured or reachable yet. Check DATABASE_URL. If you use Prisma local Postgres, run `npm run db:local:start` and then `npm run prisma:push`.";

export class AppError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode = 400, code = "app_error") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function isDatabaseUnavailableError(error: unknown) {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError ||
    error instanceof Prisma.PrismaClientUnknownRequestError
  ) {
    return /Cannot fetch data from service|fetch failed/i.test(error.message);
  }

  return false;
}

export function getErrorDetails(error: unknown) {
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      body: {
        error: error.message,
        code: error.code
      }
    };
  }

  if (error instanceof ZodError) {
    return {
      statusCode: 422,
      body: {
        error: "Validation failed",
        code: "validation_error",
        issues: error.flatten()
      }
    };
  }

  if (isDatabaseUnavailableError(error)) {
    return {
      statusCode: 503,
      body: {
        error: DATABASE_UNAVAILABLE_MESSAGE,
        code: "database_unavailable"
      }
    };
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return {
      statusCode: 400,
      body: {
        error: error.message,
        code: error.code
      }
    };
  }

  console.error(error);
  return {
    statusCode: 500,
    body: {
      error: "Internal server error",
      code: "internal_error"
    }
  };
}
