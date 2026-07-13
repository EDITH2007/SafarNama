import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const envPublicUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const envDeployment = process.env.CONVEX_DEPLOYMENT;
  
  let pingResult = "Not attempted";
  let pingError = null;

  if (envPublicUrl) {
    try {
      const client = new ConvexHttpClient(envPublicUrl);
      const res = await client.action("auth:signIn" as any, {
        provider: "password",
        params: {
          email: "test@gmail.com",
          password: "test123456",
          flow: "signIn"
        }
      });
      pingResult = `Success: ${JSON.stringify(res)}`;
    } catch (e: any) {
      pingError = {
        name: e.name,
        message: e.message,
        stack: e.stack,
        keys: Object.keys(e),
        string: String(e)
      };
    }
  }

  return NextResponse.json({
    envPublicUrl,
    envDeployment,
    pingResult,
    pingError
  });
}
