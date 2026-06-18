import * as cheerio from "cheerio";
import { ALBUMS, type Album } from "@/config/albums";
import type { Product, SyncResponse } from "@/lib/types";

const SELECTORS = {
  albumLink: "a.album__main",
  albumName: ".album__name, .album__title, [class*='album__name'], [class*='album__title']",
  // Ordem: img dentro do link, depois qualquer img com classe album
  albumCover: "img",
  albumLinkFallback: 'a[href*="/albums/"]',
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

function parseAlbumsPage(html: string, baseUrl: string, albumNome: string): Omit<Product, "categoria" | "albumNome" | "albumUrl">[] {
  const $ = cheerio.load(html);
  const produtos: Omit<Product, "categoria" | "albumNome" | "albumUrl">[] = [];
  const origin = (() => { try { const u = new URL(baseUrl); return `${u.protocol}//${u.host}`; } catch { return ""; } })();

  let links = $(SELECTORS.albumLink);
  if (links.length === 0) links = $(SELECTORS.albumLinkFallback);

  links.each((_, el) => {
    const $el = $(el);
    const href = $el.attr("href") ?? "";
    if (!/\/albums\/\d+/.test(href)) return;

    const nome =
      $el.find(SELECTORS.albumName).first().text().trim() ||
      $el.attr("title") ||
      $el.text().trim() ||
      "Produto";

    // Yupoo usa lazy loading: a URL real fica em data-src, data-original ou src
    const coverEl = $el.find(SELECTORS.albumCover).first();
    const rawCover =
      coverEl.attr("data-src") ||
      coverEl.attr("data-original") ||
      coverEl.attr("data-lazy") ||
      coverEl.attr("src") ||
      "";
    // Garante protocolo absoluto (alguns src vêm sem "https:")
    const coverUrl = rawCover.startsWith("//") ? `https:${rawCover}` : rawCover;

    const productUrl = href.startsWith("http") ? href : `${origin}${href}`;
    const id = `${albumNome}-${href.replace(/\D/g, "")}`;

    if (nome && productUrl) {
      produtos.push({ id, nome, coverUrl: coverUrl || "/placeholder.jpg", productUrl });
    }
  });

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
  { id: "demo-1", nome: "Air Jordan 1 High OG", categoria: "Tênis",   albumNome: "Demo Store", albumUrl: "#", coverUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop", productUrl: "#" },
  { id: "demo-2", nome: "Yeezy Boost 350 V2",   categoria: "Tênis",   albumNome: "Demo Store", albumUrl: "#", coverUrl: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop", productUrl: "#" },
  { id: "demo-3", nome: "Bolsa Shoulder Premium",categoria: "Bolsas",  albumNome: "Demo Store", albumUrl: "#", coverUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop", productUrl: "#" },
  { id: "demo-4", nome: "Camiseta Oversized Drop",categoria: "Roupas", albumNome: "Demo Store", albumUrl: "#", coverUrl: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=400&fit=crop", productUrl: "#" },
  { id: "demo-5", nome: "Tênis Infantil Kids",   categoria: "Infantil",albumNome: "Demo Store", albumUrl: "#", coverUrl: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=400&h=400&fit=crop", productUrl: "#" },
  { id: "demo-6", nome: "Carteira Luxo Couro",   categoria: "Luxo",    albumNome: "Demo Store", albumUrl: "#", coverUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop", productUrl: "#" },
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
