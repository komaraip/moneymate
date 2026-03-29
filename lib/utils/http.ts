import { NextResponse } from "next/server";
import { getErrorDetails } from "@/lib/utils/errors";

export function jsonOk(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function jsonError(error: unknown) {
  const details = getErrorDetails(error);
  return NextResponse.json(details.body, {
    status: details.statusCode
  });
}

