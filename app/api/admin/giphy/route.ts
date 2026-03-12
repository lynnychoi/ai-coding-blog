import { NextRequest, NextResponse } from "next/server";
import { getExpectedToken, AUTH_COOKIE } from "../../../../lib/auth";

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get(AUTH_COOKIE)?.value;
  const expected = await getExpectedToken();
  if (cookie !== expected) return NextResponse.json([], { status: 401 });

  const q = req.nextUrl.searchParams.get("q") || "";
  const apiKey = process.env.GIPHY_API_KEY || "dc6zaTOxFJmzC";

  const url = q
    ? `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(q)}&limit=15&rating=g`
    : `https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=15&rating=g`;

  const res = await fetch(url);
  const json = await res.json() as { data: Array<{ id: string; title: string; images: { fixed_width_small: { url: string } } }> };

  return NextResponse.json(
    (json.data || []).map((gif) => ({
      id: gif.id,
      title: gif.title,
      preview: gif.images.fixed_width_small.url,
      url: `https://media.giphy.com/media/${gif.id}/giphy.gif`,
    }))
  );
}
