import { NextResponse } from "next/server";

export type FormatType = "bold" | "color" | "핵심";
export type Suggestion = { text: string; format: FormatType };

export async function POST() {
  return NextResponse.json({ suggestions: [] });
}
