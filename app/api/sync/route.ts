import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { ALBUMS, type Album } from "@/config/albums";
import type { Product, SyncResponse } from "@/lib/types";

export const runtime = "nodejs";
export const revalidate = 900; // 15 minutos de cache

// ─── Seletores CSS do Yupoo — isole aqui para facilitar atualização ──────────
const SELECTORS = {
  // links de álbum individual numa página de albums
  albumLink: "a.album__main",
  albumName: ".album__name, .album__title, [class*='album__name'], [class*='album__title']",
  albumCover: "img.album__img, img[class*='album__img'], .album__cover img",
  // fallback: qualquer link que case com /albums/NNN
  albumLinkFallback: 'a[href*="/albums/"]',
  // seletor de foto dentro de um álbum individual
  photoImg: ".photo__img img, img.photo__img, [class*='photo__'] img",
};

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
  Referer: "https://x.yupoo.com/",
};

// ─── Tenta autenticar num álbum com senha via POST (best-effort) ──────────────
// NOTA: o cookie de sessão do Yupoo é vinculado ao domínio e pode não persistir
// entre requisições separadas no ambiente serverless. Tratamos como melhor esforço;
// se falhar, a loja é marcada com erro e o sync continua.
async function authenticateAlbum(baseUrl: string, senha: string): Promise<string | null> {
  try {
    // Descobre o domínio base a partir da URL do álbum
    const url = new URL(baseUrl);
    const loginUrl = `${url.protocol}//${url.host}/member/login`;

    const formData = new URLSearchParams({ password: senha });
    const res = await fetch(loginUrl, {
      method: "POST",
      headers: {
        ...HEADERS,
        "Content-Type": "application/x-www-form-urlencoded",
        Referer: baseUrl,
      },
      body: formData.toString(),
      redirect: "manual",
    });

    // Extrai o cookie de sessão para reutilizar nas próximas requisições
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) {
      const sessionCookie = setCookie.split(";")[0];
      return sessionCookie;
    }
    return null;
  } catch {
    return null;
  }
}

// ─── Faz o parse da página de álbuns de uma loja ─────────────────────────────
function parseAlbumsPage(html: string, baseUrl: string, albumNome: string): Omit<Product, "categoria" | "albumNome" | "albumUrl">[] {
  const $ = cheerio.load(html);
  const produtos: Omit<Product, "categoria" | "albumNome" | "albumUrl">[] = [];

  const url = new URL(baseUrl);
  const origin = `${url.protocol}//${url.host}`;

  // Tenta o seletor principal, depois o fallback
  let links = $(SELECTORS.albumLink);
  if (links.length === 0) links = $(SELECTORS.albumLinkFallback);

  links.each((_, el) => {
    const $el = $(el);
    const href = $el.attr("href") ?? "";

    // Filtra apenas links que sejam realmente álbuns de produto (/albums/NNN)
    if (!/\/albums\/\d+/.test(href)) return;

    // Tenta extrair nome do produto
    const nome =
      $el.find(SELECTORS.albumName).first().text().trim() ||
      $el.attr("title") ||
      $el.text().trim() ||
      "Produto";

    // Tenta extrair a imagem de capa
    const coverEl = $el.find(SELECTORS.albumCover).first();
    const coverUrl =
      coverEl.attr("data-src") ||
      coverEl.attr("src") ||
      coverEl.attr("data-original") ||
      "";

    const productUrl = href.startsWith("http") ? href : `${origin}${href}`;
    const id = `${albumNome}-${href.replace(/\D/g, "")}`;

    if (nome && productUrl) {
      produtos.push({ id, nome, coverUrl: coverUrl || "/placeholder.jpg", productUrl });
    }
  });

  return produtos;
}

// ─── Processa uma loja individual ────────────────────────────────────────────
async function processAlbum(album: Album): Promise<{ produtos: Product[]; erro?: string }> {
  try {
    let sessionCookie: string | null = null;

    if (album.senha) {
      sessionCookie = await authenticateAlbum(album.url, album.senha);
    }

    const res = await fetch(album.url, {
      headers: {
        ...HEADERS,
        ...(sessionCookie ? { Cookie: sessionCookie } : {}),
      },
      next: { revalidate: 900 },
    });

    if (!res.ok) {
      return { produtos: [], erro: `${album.nome}: HTTP ${res.status}` };
    }

    const html = await res.text();
    const parciais = parseAlbumsPage(html, album.url, album.nome);

    const produtos: Product[] = parciais.map((p) => ({
      ...p,
      categoria: album.categoria,
      albumNome: album.nome,
      albumUrl: album.url,
    }));

    return { produtos };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { produtos: [], erro: `${album.nome}: ${msg}` };
  }
}

// ─── Produtos de demonstração — usados quando o sync retorna zero produtos ────
const DEMO_PRODUTOS: Product[] = [
  {
    id: "demo-1",
    nome: "Air Jordan 1 High OG",
    categoria: "Tênis",
    albumNome: "Demo Store",
    albumUrl: "#",
    coverUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
    productUrl: "#",
  },
  {
    id: "demo-2",
    nome: "Yeezy Boost 350 V2",
    categoria: "Tênis",
    albumNome: "Demo Store",
    albumUrl: "#",
    coverUrl: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop",
    productUrl: "#",
  },
  {
    id: "demo-3",
    nome: "Bolsa Shoulder Premium",
    categoria: "Bolsas",
    albumNome: "Demo Store",
    albumUrl: "#",
    coverUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop",
    productUrl: "#",
  },
  {
    id: "demo-4",
    nome: "Camiseta Oversized Drop",
    categoria: "Roupas",
    albumNome: "Demo Store",
    albumUrl: "#",
    coverUrl: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=400&fit=crop",
    productUrl: "#",
  },
  {
    id: "demo-5",
    nome: "Tênis Infantil Kids",
    categoria: "Infantil",
    albumNome: "Demo Store",
    albumUrl: "#",
    coverUrl: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=400&h=400&fit=crop",
    productUrl: "#",
  },
  {
    id: "demo-6",
    nome: "Carteira Luxo Couro",
    categoria: "Luxo",
    albumNome: "Demo Store",
    albumUrl: "#",
    coverUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
    productUrl: "#",
  },
];

// ─── Handler principal ────────────────────────────────────────────────────────
export async function GET() {
  const resultados = await Promise.allSettled(ALBUMS.map(processAlbum));

  const todosProdutos: Product[] = [];
  const erros: string[] = [];

  for (const resultado of resultados) {
    if (resultado.status === "fulfilled") {
      todosProdutos.push(...resultado.value.produtos);
      if (resultado.value.erro) erros.push(resultado.value.erro);
    } else {
      erros.push(String(resultado.reason));
    }
  }

  const demoMode = todosProdutos.length === 0;
  const produtos = demoMode ? DEMO_PRODUTOS : todosProdutos;

  const body: SyncResponse = {
    produtos,
    cachedAt: new Date().toISOString(),
    ...(demoMode ? { demoMode: true } : {}),
    ...(erros.length > 0 ? { erros } : {}),
  };

  return NextResponse.json(body, {
    headers: { "Cache-Control": "s-maxage=900, stale-while-revalidate=1800" },
  });
}
