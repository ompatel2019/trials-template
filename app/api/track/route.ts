import { NextRequest, NextResponse } from "next/server";
import { trackEvent, isAllowedEvent } from "@/lib/analytics";

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const { event, trial, sid, ...meta } = body;

  if (typeof event !== "string" || !isAllowedEvent(event)) {
    return new NextResponse(null, { status: 400 });
  }
  if (typeof trial !== "string" || !trial) {
    return new NextResponse(null, { status: 400 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const ua = request.headers.get("user-agent") || "";
  const ref = request.headers.get("referer") || "";

  trackEvent(event, {
    trial: trial as string,
    sid: typeof sid === "string" ? sid : undefined,
    ip,
    ua,
    ref,
    ...meta,
  });

  return new NextResponse(null, { status: 204 });
}
