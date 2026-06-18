"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Header } from "./Header";
import { CategoryRail } from "./CategoryRail";
import { ProductCard } from "./ProductCard";
import { ProductModal } from "./ProductModal";
import type { Product, SyncResponse } from "@/lib/types";
import type { Categoria } from "@/config/albums";
import { AlertTriangle } from "lucide-react";

const LS_FAVS = "manifesto_favs";
const LS_RECENT = "manifesto_recent";

function useLocalStorage<T>(key: string, init: T): [T, (val: T) => void] {
  const [state, setState] = useState<T>(init);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setState(JSON.parse(raw) as T);
    } catch {}
  }, [key]);

  const set = useCallback(
    (val: T) => {
      setState(val);
      try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
    },
    [key]
  );

  return [state, set];
}

export function CatalogClient({ data }: { data: SyncResponse }) {
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [favs, setFavs] = useLocalStorage<string[]>(LS_FAVS, []);
  const [recent, setRecent] = useLocalStorage<Product[]>(LS_RECENT, []);

  const toggleFav = useCallback(
    (id: string) => {
      setFavs(favs.includes(id) ? favs.filter((f) => f !== id) : [...favs, id]);
    },
    [favs, setFavs]
  );

  const openProduct = useCallback(
    (product: Product) => {
      setSelectedProduct(product);
      const updated = [product, ...recent.filter((p) => p.id !== product.id)].slice(0, 12);
      setRecent(updated);
    },
    [recent, setRecent]
  );

  const filtered = useMemo(() => {
    return data.produtos.filter((p) => {
      const matchCat = !categoria || p.categoria === categoria;
      const matchSearch =
        !search ||
        p.nome.toLowerCase().includes(search.toLowerCase()) ||
        p.categoria.toLowerCase().includes(search.toLowerCase()) ||
        p.albumNome.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [data.produtos, categoria, search]);

  const favProducts = useMemo(
    () => data.produtos.filter((p) => favs.includes(p.id)),
    [data.produtos, favs]
  );

  return (
    <div className="min-h-screen bg-[#0b0c0f] text-[#f3f1ec]">
      <Header search={search} onSearch={setSearch} />

      {/* Demo mode banner */}
      {data.demoMode && (
        <div className="bg-[#d6552f]/10 border-b border-[#d6552f]/30 px-4 py-2 flex items-center gap-2">
          <AlertTriangle size={14} className="text-[#d6552f] flex-shrink-0" />
          <p className="font-mono text-[11px] text-[#d6552f] uppercase tracking-wide">
            Modo demo — não foi possível acessar os catálogos. Exibindo produtos de exemplo.
          </p>
        </div>
      )}

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[#2a2d35] px-4 py-16">
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#cf9d4f 1px, transparent 1px), linear-gradient(90deg, #cf9d4f 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="max-w-7xl mx-auto relative">
          <div className="inline-flex items-center gap-2 border border-dashed border-[#cf9d4f]/40 px-3 py-1 rounded mb-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#cf9d4f]">
              Catálogo Verificado
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#cf9d4f] animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-[#f3f1ec] leading-none mb-3">
            MANIFESTO
          </h1>
          <p className="text-[#555b6b] text-sm max-w-md">
            Vitrine agregada de múltiplos catálogos Yupoo. Produtos diretos da fonte,{" "}
            <span className="text-[#cf9d4f]">{data.produtos.length} itens</span> disponíveis.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-10">
        {/* Recently viewed */}
        {recent.length > 0 && !search && !categoria && (
          <section>
            <h2 className="font-mono text-[11px] uppercase tracking-widest text-[#555b6b] mb-4">
              Vistos recentemente
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {recent.slice(0, 6).map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  isFavorited={favs.includes(p.id)}
                  onFavorite={toggleFav}
                  onClick={openProduct}
                />
              ))}
            </div>
          </section>
        )}

        {/* Favoritos */}
        {favProducts.length > 0 && !search && !categoria && (
          <section id="favoritos">
            <h2 className="font-mono text-[11px] uppercase tracking-widest text-[#555b6b] mb-4">
              Favoritos
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {favProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  isFavorited={true}
                  onFavorite={toggleFav}
                  onClick={openProduct}
                />
              ))}
            </div>
          </section>
        )}

        {/* Catalog */}
        <section id="catalogo">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
            <h2 className="font-mono text-[11px] uppercase tracking-widest text-[#555b6b]">
              Catálogo
            </h2>
            <div className="flex-1">
              <CategoryRail selected={categoria} onChange={setCategoria} />
            </div>
            <span className="font-mono text-[10px] text-[#555b6b]">
              {filtered.length} item{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-mono text-[11px] uppercase tracking-widest text-[#555b6b]">
                nenhum produto encontrado
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {filtered.map((p) => (
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
        </section>
      </main>

      <ProductModal
        product={selectedProduct}
        isFavorited={selectedProduct ? favs.includes(selectedProduct.id) : false}
        onFavorite={toggleFav}
        onClose={() => setSelectedProduct(null)}
      />

      <footer className="border-t border-[#2a2d35] mt-20 px-4 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <span className="font-mono text-[10px] text-[#555b6b] uppercase tracking-widest">
            Manifesto — Vitrine Yupoo
          </span>
          {data.cachedAt && (
            <span className="font-mono text-[10px] text-[#2a2d35]" suppressHydrationWarning>
              sync {new Date(data.cachedAt).toLocaleTimeString("pt-BR")}
            </span>
          )}
        </div>
      </footer>
    </div>
  );
}
