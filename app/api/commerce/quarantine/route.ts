import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.API_BASE_URL ?? "http://localhost:3001";

export async function GET() {
  const response = await fetch(`${API_BASE}/commerce/quarantine`);
  const data = await response.json().catch(() => ({}));
  return NextResponse.json(data, { status: response.status });
}
