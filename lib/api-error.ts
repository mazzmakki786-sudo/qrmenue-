import { NextResponse } from "next/server"

const MAX_BODY_SIZE = 1 * 1024 * 1024

type RouteHandler<T = { params: Promise<Record<string, string>> }> = (
  request: Request,
  context: T
) => Promise<NextResponse>

export function safeRoute<T = { params: Promise<Record<string, string>> }>(
  handler: RouteHandler<T>
): RouteHandler<T> {
  return async (request: Request, context: T) => {
    if (["POST", "PUT", "PATCH"].includes(request.method)) {
      const contentLength = request.headers.get("content-length")
      if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
        return NextResponse.json(
          { error: "PAYLOAD_TOO_LARGE", message: "Request body too large" },
          { status: 413 }
        )
      }
    }

    try {
      return await handler(request, context)
    } catch (err: unknown) {
      console.error("[API Error]", err)
      return NextResponse.json(
        { error: "INTERNAL_SERVER_ERROR", message: "An unexpected error occurred" },
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
