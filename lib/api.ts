import { NextResponse } from "next/server";
import type { ApiAuthFailure } from "./auth";

/**
 * One shape for every API response, so callers can rely on it.
 *
 * Success is whatever the route returns. Failure is always
 * { error: string } with an appropriate status. Nothing fails silently:
 * every server-side failure is logged with the route name before it is
 * returned, and the message sent to the browser never leaks internals.
 */

export function ok<T extends object>(data: T) {
  return NextResponse.json(data);
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function unauthorized(message = "You must be signed in.") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbidden(message = "You do not have access to this.") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function notFound(message = "Not found.") {
  return NextResponse.json({ error: message }, { status: 404 });
}

/**
 * A dependency we do not control failed. Logs the cause with the route name,
 * returns a message safe to show a person.
 */
export function upstreamFailure(
  route: string,
  cause: unknown,
  message: string,
) {
  console.error(`[${route}]`, cause);
  return NextResponse.json({ error: message }, { status: 502 });
}

/** This deployment is missing the credentials the route needs. */
export function notConfigured(message: string) {
  return NextResponse.json(
    { configured: false, error: message },
    { status: 503 },
  );
}

/** Parse a JSON body, returning null when the body is absent or malformed. */
export async function readJson<T>(req: Request): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}

/** Turn a failed auth check into its response. */
export function authFailure(failure: ApiAuthFailure) {
  return NextResponse.json(
    { error: failure.error },
    { status: failure.status },
  );
}
