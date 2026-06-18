import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Proxy de imagem: busca a foto do Yupoo com Referer correto (hotlink protection bypass)
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url || !url.startsWith("http")) {
    return new NextResponse("url inválida", { status: 400 });
  }

  // Só faz proxy de domínios confiáveis para evitar abuse
  const allowed = ["yupoo.com", "unsplash.com"];
  const isAllowed = allowed.some((d) => {
    try { return new URL(url).hostname.endsWith(d); } catch { return false; }
  });
  if (!isAllowed) {
    return new NextResponse("domínio não permitido", { status: 403 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        // Referer apontando para o próprio Yupoo — necessário para passar a hotlink protection
        Referer: "https://x.yupoo.com/",
        Accept: "image/webp,image/avif,image/*,*/*;q=0.8",
      },
    });

    if (!res.ok) {
      return new NextResponse("erro ao buscar imagem", { status: res.status });
    }

    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return new NextResponse("erro interno", { status: 500 });
  }
}
