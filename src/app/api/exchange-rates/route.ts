import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/INR", {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!res.ok) {
      throw new Error(`Exchange rate API responded with status ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json({
      base: "INR",
      rates: data.rates || {},
      updated: data.time_last_update_utc || new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[API exchange-rates] Failed to fetch rates:", error);
    return NextResponse.json(
      {
        base: "INR",
        rates: {
          INR: 1,
          USD: 0.012,
          EUR: 0.011,
          GBP: 0.0094,
          AED: 0.044,
        },
        fallback: true,
      },
      { status: 200 }
    );
  }
}
