import { NextRequest, NextResponse } from "next/server";
import { getExpectedToken, AUTH_COOKIE } from "../../../../lib/auth";

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get(AUTH_COOKIE)?.value;
  const expected = await getExpectedToken();
  return NextResponse.json({ loggedIn: cookie === expected });
}
