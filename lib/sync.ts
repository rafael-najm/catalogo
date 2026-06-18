import * as cheerio from "cheerio";
import { ALBUMS, type Album } from "@/config/albums";
import type { Product, SyncResponse } from "@/lib/types";

const SELECTORS = {
  // Páginas /albums — link principal do álbum
  albumLink: "a.album__main",
  albumName: ".album__name, .album__title, [class*='album__name'], [class*='album__title']",
  albumCover: "img",
  albumLinkFallback: 'a[href*="/albums/"]',
  // Páginas /categories — cada item é um link para um álbum individual
  categoryLink: 'a[href*="/albums/"]',
};

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
  Referer: "https://x.yupoo.com/",
};

// NOTA: autenticação por cookie é best-effort em serverless — o cookie pode não
// persistir entre requests separadas. Documentado aqui, não fingimos que funciona 100%.
async function authenticateAlbum(baseUrl: string, senha: string): Promise<string | null> {
  try {
    const url = new URL(baseUrl);
    const loginUrl = `${url.protocol}//${url.host}/member/login`;
    const res = await fetch(loginUrl, {
      method: "POST",
      headers: { ...HEADERS, "Content-Type": "application/x-www-form-urlencoded", Referer: baseUrl },
      body: new URLSearchParams({ password: senha }).toString(),
      redirect: "manual",
    });
    const cookie = res.headers.get("set-cookie");
    return cookie ? cookie.split(";")[0] : null;
  } catch {
    return null;
  }
}

function resolveUrl(href: string, origin: string): string {
  if (href.startsWith("http")) return href;
  if (href.startsWith("//")) return `https:${href}`;
  return `${origin}${href.startsWith("/") ? "" : "/"}${href}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractCover($el: ReturnType<typeof cheerio.load>, imgEl: any): string {
  const $img = $el(imgEl);
  const raw =
    $img.attr("data-src") ||
    $img.attr("data-original") ||
    $img.attr("data-lazy") ||
    $img.attr("src") ||
    "";
  return raw.startsWith("//") ? `https:${raw}` : raw;
}

function parseProductLinks(
  $: ReturnType<typeof cheerio.load>,
  origin: string,
  albumNome: string,
  linkSelector: string
): Omit<Product, "categoria" | "albumNome" | "albumUrl">[] {
  const produtos: Omit<Product, "categoria" | "albumNome" | "albumUrl">[] = [];

  $(linkSelector).each((_, el) => {
    const $el = $(el);
    const href = $el.attr("href") ?? "";
    if (!/\/albums\/\d+/.test(href)) return;

    const nome =
      $el.find(SELECTORS.albumName).first().text().trim() ||
      $el.attr("title") ||
      $el.text().trim() ||
      "Produto";

    const imgEl = $el.find(SELECTORS.albumCover).get(0);
    const coverUrl = imgEl ? extractCover($, imgEl) : "";

    const productUrl = resolveUrl(href, origin);
    const id = `${albumNome}-${href.replace(/\D/g, "")}`;

    if (productUrl) {
      produtos.push({ id, nome: nome || "Produto", coverUrl: coverUrl || "/placeholder.jpg", productUrl });
    }
  });

  return produtos;
}

function parseAlbumsPage(html: string, baseUrl: string, albumNome: string): Omit<Product, "categoria" | "albumNome" | "albumUrl">[] {
  const $ = cheerio.load(html);
  const origin = (() => { try { const u = new URL(baseUrl); return `${u.protocol}//${u.host}`; } catch { return ""; } })();
  const isCategory = /\/categories\//.test(baseUrl);

  if (isCategory) {
    // Páginas de categoria: todos os links para /albums/NNN são produtos
    return parseProductLinks($, origin, albumNome, SELECTORS.categoryLink);
  }

  // Páginas /albums: tenta seletor principal, depois fallback genérico
  let produtos = parseProductLinks($, origin, albumNome, SELECTORS.albumLink);
  if (produtos.length === 0) {
    produtos = parseProductLinks($, origin, albumNome, SELECTORS.albumLinkFallback);
  }
  return produtos;
}

async function processAlbum(album: Album): Promise<{ produtos: Product[]; erro?: string }> {
  try {
    let sessionCookie: string | null = null;
    if (album.senha) sessionCookie = await authenticateAlbum(album.url, album.senha);

    const res = await fetch(album.url, {
      headers: { ...HEADERS, ...(sessionCookie ? { Cookie: sessionCookie } : {}) },
      next: { revalidate: 900 },
    });

    if (!res.ok) return { produtos: [], erro: `${album.nome}: HTTP ${res.status}` };

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
    return { produtos: [], erro: `${album.nome}: ${err instanceof Error ? err.message : String(err)}` };
  }
}

export const DEMO_PRODUTOS: Product[] = [
  { id: "demo-1", nome: "Air Jordan 1 High OG",   categoria: "Tênis",  albumNome: "Demo Store", albumUrl: "#", coverUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop", productUrl: "#" },
  { id: "demo-2", nome: "Yeezy Boost 350 V2",     categoria: "Tênis",  albumNome: "Demo Store", albumUrl: "#", coverUrl: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop", productUrl: "#" },
  { id: "demo-3", nome: "Birken Arizona Classic", categoria: "Birken", albumNome: "Demo Store", albumUrl: "#", coverUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop", productUrl: "#" },
  { id: "demo-4", nome: "Camiseta Oversized Drop", categoria: "Roupas", albumNome: "Demo Store", albumUrl: "#", coverUrl: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=400&fit=crop", productUrl: "#" },
  { id: "demo-5", nome: "Carteira Luxo Couro",    categoria: "Luxo",   albumNome: "Demo Store", albumUrl: "#", coverUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop", productUrl: "#" },
  { id: "demo-6", nome: "Mule Luxo Premium",      categoria: "Luxo",   albumNome: "Demo Store", albumUrl: "#", coverUrl: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=400&h=400&fit=crop", productUrl: "#" },
];

export async function runSync(): Promise<SyncResponse> {
  const resultados = await Promise.allSettled(ALBUMS.map(processAlbum));
  const todosProdutos: Product[] = [];
  const erros: string[] = [];

  for (const r of resultados) {
    if (r.status === "fulfilled") {
      todosProdutos.push(...r.value.produtos);
      if (r.value.erro) erros.push(r.value.erro);
    } else {
      erros.push(String(r.reason));
    }
  }

  const demoMode = todosProdutos.length === 0;
  return {
    produtos: demoMode ? DEMO_PRODUTOS : todosProdutos,
    cachedAt: new Date().toISOString(),
    ...(demoMode ? { demoMode: true } : {}),
    ...(erros.length > 0 ? { erros } : {}),
  };
}
