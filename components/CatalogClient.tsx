"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { CategorySection } from "./CategorySection";
import { ProductCard } from "./ProductCard";
import { ProductModal } from "./ProductModal";
import type { Product, SyncResponse } from "@/lib/types";
import type { Categoria } from "@/config/albums";
import { CATEGORIAS } from "@/config/albums";
import { AlertTriangle, ArrowLeft } from "lucide-react";

const LS_FAVS = "manifesto_favs";
const LS_RECENT = "manifesto_recent";

function useLS<T>(key: string, init: T): [T, (v: T) => void] {
  const [s, set] = useState<T>(init);
  useEffect(() => {
    try { const r = localStorage.getItem(key); if (r) set(JSON.parse(r) as T); } catch {}
  }, [key]);
  const save = useCallback((v: T) => {
    set(v);
    try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
  }, [key]);
  return [s, save];
}

export function CatalogClient({ data }: { data: SyncResponse }) {
  const [search, setSearch] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState<Categoria | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [favs, setFavs] = useLS<string[]>(LS_FAVS, []);
  const [recent, setRecent] = useLS<Product[]>(LS_RECENT, []);

  const toggleFav = useCallback((id: string) => {
    setFavs(favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id]);
  }, [favs, setFavs]);

  const openProduct = useCallback((p: Product) => {
    setSelectedProduct(p);
    const updated = [p, ...recent.filter(r => r.id !== p.id)].slice(0, 12);
    setRecent(updated);
  }, [recent, setRecent]);

  const handleSearch = useCallback((v: string) => {
    setSearch(v);
    if (v) setCategoriaFiltro(null);
  }, []);

  const isFiltered = !!(search || categoriaFiltro);

  const filtered = useMemo(() => {
    if (!isFiltered) return [];
    return data.produtos.filter(p => {
      const matchCat = !categoriaFiltro || p.categoria === categoriaFiltro;
      const q = search.toLowerCase();
      const matchSearch = !search || p.nome.toLowerCase().includes(q) || p.albumNome.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [data.produtos, categoriaFiltro, search, isFiltered]);

  const byCategoria = useMemo(() => {
    const map = {} as Record<Categoria, Product[]>;
    for (const p of data.produtos) {
      if (!map[p.categoria]) map[p.categoria] = [];
      map[p.categoria].push(p);
    }
    return map;
  }, [data.produtos]);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header search={search} onSearch={handleSearch} />

      {data.demoMode && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 bg-[#1a0a0a] border border-[#c94a2a]/40 text-[#c94a2a] text-[10px] font-mono uppercase tracking-widest px-4 py-2 rounded-full">
          <AlertTriangle size={11} />
          Modo demo — catálogos indisponíveis
        </div>
      )}

      {!isFiltered ? (
        <>
          <Hero totalProdutos={data.produtos.length} />
          {CATEGORIAS.map(cat => (
            <CategorySection
              key={cat}
              title={cat}
              products={byCategoria[cat] ?? []}
              favs={favs}
              onFavorite={toggleFav}
              onClick={openProduct}
              onVerTodos={c => setCategoriaFiltro(c)}
            />
          ))}

          {/* Recentes */}
          {recent.length > 0 && (
            <section className="py-12 border-t border-white/5">
              <div className="max-w-7xl mx-auto px-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/25 mb-6">
                  Vistos recentemente
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-7">
                  {recent.slice(0, 6).map(p => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      isFavorited={favs.includes(p.id)}
                      onFavorite={toggleFav}
                      onClick={openProduct}
                    />
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      ) : (
        <div className="max-w-7xl mx-auto px-5 pt-24 pb-16">
          {/* Filter header */}
          <div className="flex items-center gap-4 mb-10">
            <button
              onClick={() => { setSearch(""); setCategoriaFiltro(null); }}
              className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-white/30 hover:text-white transition-colors"
            >
              <ArrowLeft size={11} /> Voltar
            </button>
            <div className="h-px flex-1 bg-white/5" />
            {categoriaFiltro && (
              <span className="font-display text-3xl font-bold uppercase text-white">{categoriaFiltro}</span>
            )}
            {search && (
              <span className="font-mono text-xs text-white/40">"{search}"</span>
            )}
            <span className="font-mono text-[10px] text-white/20">{filtered.length} itens</span>
          </div>

          {filtered.length === 0 ? (
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/20 py-20 text-center">
              nenhum produto encontrado
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-7">
              {filtered.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  isFavorited={favs.includes(p.id)}
                  onFavorite={toggleFav}
                  onClick={openProduct}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <footer className="border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-5 flex justify-between items-center">
          <span className="font-mono text-[10px] text-white/15 uppercase tracking-widest">Manifesto</span>
          <span className="font-mono text-[10px] text-white/10" suppressHydrationWarning>
            {data.cachedAt ? new Date(data.cachedAt).toLocaleTimeString("pt-BR") : ""}
          </span>
        </div>
      </footer>

      <ProductModal
        product={selectedProduct}
        isFavorited={selectedProduct ? favs.includes(selectedProduct.id) : false}
        onFavorite={toggleFav}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
