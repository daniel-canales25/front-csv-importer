import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.API_BASE_URL ?? "http://localhost:3001";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pcProcessdate = searchParams.get("pcProcessdate");

  const url = pcProcessdate
    ? `${API_BASE}/commerce/quarantine?pcProcessdate=${encodeURIComponent(pcProcessdate)}`
    : `${API_BASE}/commerce/quarantine`;

  const response = await fetch(url);
  const data = await response.json().catch(() => ({}));
  return NextResponse.json(data, { status: response.status });
}
