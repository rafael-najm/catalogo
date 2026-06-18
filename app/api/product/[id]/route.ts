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

// Atributos de imagem onde o Yupoo coloca a URL real (em ordem de prioridade)
const IMG_ATTRS = ["data-src", "data-original", "data-lazy", "data-url", "src"];

// Seletores CSS tentados em ordem — o primeiro que retornar resultados é usado
const PHOTO_SELECTORS = [
  ".photo__img img",
  "img.photo__img",
  ".showalbum__children img",
  ".showalbum__children .showalbum__photo img",
  "[class*='showalbum'] img",
  "[class*='photo__'] img",
  "[class*='album__'] img",
  "figure img",
  // Fallback amplo: qualquer img cujo src/data-src aponte para o CDN do Yupoo
  "img",
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractSrc($el: cheerio.Cheerio<any>, $: cheerio.CheerioAPI): string {
  for (const attr of IMG_ATTRS) {
    const val = $el.attr(attr) ?? "";
    if (!val) continue;
    // Normaliza URLs relativas de protocolo (//cdn.yupoo.com/...)
    const normalized = val.startsWith("//") ? `https:${val}` : val;
    // Só aceita URLs do CDN do Yupoo (evita placeholders 1x1 do lazy loader)
    if (normalized.startsWith("http") && normalized.includes("yupoo")) {
      return normalized;
    }
  }
  return "";
}

function parsePhotos(html: string): string[] {
  const $ = cheerio.load(html);
  const seen = new Set<string>();
  const fotos: string[] = [];

  for (const selector of PHOTO_SELECTORS) {
    $(selector).each((_, el) => {
      const src = extractSrc($(el), $);
      if (src && !seen.has(src)) {
        seen.add(src);
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
  const coverUrl = searchParams.get("cover") ?? "";

  if (!productUrl) {
    return NextResponse.json({ error: "url param required" }, { status: 400 });
  }

  if (productUrl === "#") {
    return NextResponse.json({
      fotos: [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=800&fit=crop",
      ],
      nome: id,
      productUrl,
    } satisfies ProductDetailResponse);
  }

  try {
    const res = await fetch(productUrl, {
      headers: HEADERS,
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      // Se a página falhar, devolve pelo menos a capa para o modal não ficar vazio
      return NextResponse.json({
        fotos: coverUrl ? [coverUrl] : [],
        nome: id,
        productUrl,
      } satisfies ProductDetailResponse);
    }

    const html = await res.text();
    const fotos = parsePhotos(html);

    // Garante que a capa aparece primeiro se não foi encontrada no parse
    if (coverUrl && !fotos.includes(coverUrl)) fotos.unshift(coverUrl);

    return NextResponse.json(
      { fotos: fotos.length > 0 ? fotos : [coverUrl].filter(Boolean), nome: id, productUrl } satisfies ProductDetailResponse,
      { headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=7200" } }
    );
  } catch {
    return NextResponse.json({
      fotos: coverUrl ? [coverUrl] : [],
      nome: id,
      productUrl,
    } satisfies ProductDetailResponse);
  }
}
