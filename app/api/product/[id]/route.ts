import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import type { ProductDetailResponse } from "@/lib/types";

export const runtime = "nodejs";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
  Referer: "https://x.yupoo.com/",
};

// Seletores para fotos dentro de um álbum individual
const PHOTO_SELECTORS = [
  ".photo__img img",
  "img.photo__img",
  "[class*='photo'] img",
  ".album-photo img",
  "img[class*='photo']",
  ".viewer__img img",
  "img[src*='photo']",
];

function parsePhotos(html: string): string[] {
  const $ = cheerio.load(html);
  const fotos: string[] = [];

  for (const selector of PHOTO_SELECTORS) {
    $(selector).each((_, el) => {
      const src =
        $(el).attr("data-src") ||
        $(el).attr("src") ||
        $(el).attr("data-original") ||
        "";
      if (src && src.startsWith("http") && !fotos.includes(src)) {
        fotos.push(src);
      }
    });
    if (fotos.length > 0) break;
  }

  return fotos;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const productUrl = searchParams.get("url");

  if (!productUrl) {
    return NextResponse.json({ error: "url param required" }, { status: 400 });
  }

  // Produtos demo não têm URL real
  if (productUrl === "#") {
    const body: ProductDetailResponse = {
      fotos: [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=800&fit=crop",
      ],
      nome: id,
      productUrl,
    };
    return NextResponse.json(body);
  }

  try {
    const res = await fetch(productUrl, {
      headers: HEADERS,
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `HTTP ${res.status}` }, { status: res.status });
    }

    const html = await res.text();
    const fotos = parsePhotos(html);

    const body: ProductDetailResponse = {
      fotos: fotos.length > 0 ? fotos : ["/placeholder.jpg"],
      nome: id,
      productUrl,
    };

    return NextResponse.json(body, {
      headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=7200" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
