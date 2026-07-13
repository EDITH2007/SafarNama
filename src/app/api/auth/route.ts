import { proxyAuthActionToConvex } from "@convex-dev/auth/nextjs/server";
import { NextRequest } from "next/server";

export const runtime = "nodejs"; // Ensure Node.js runtime, not Edge

export async function POST(request: NextRequest) {
  return proxyAuthActionToConvex(request, {});
}
