import { NextResponse } from "next/server"

type RouteHandler<T = { params: Promise<Record<string, string>> }> = (
  request: Request,
  context: T
) => Promise<NextResponse>

export function safeRoute<T = { params: Promise<Record<string, string>> }>(
  handler: RouteHandler<T>
): RouteHandler<T> {
  return async (request: Request, context: T) => {
    try {
      return await handler(request, context)
    } catch (err: unknown) {
      console.error("[API Error]", err)
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred"
      return NextResponse.json(
        { error: "INTERNAL_SERVER_ERROR", message },
        { status: 500 }
      )
    }
  }
}

export async function safeJson(request: Request): Promise<unknown> {
  try {
    return await request.json()
  } catch {
    return NextResponse.json(
      { error: "INVALID_JSON", message: "Invalid JSON in request body" },
      { status: 400 }
    )
  }
}
