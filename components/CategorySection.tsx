"use client";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/lib/types";
import type { Categoria } from "@/config/albums";

type Props = {
  title: Categoria;
  products: Product[];
  favs: string[];
  onFavorite: (id: string) => void;
  onClick: (p: Product) => void;
  onVerTodos: (cat: Categoria) => void;
};

export function CategorySection({ title, products, favs, onFavorite, onClick, onVerTodos }: Props) {
  if (products.length === 0) return null;
  const shown = products.slice(0, 12);

  return (
    <section id={title.toLowerCase()} className="py-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-5">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#c8a96e] mb-2">
              {products.length} itens
            </p>
            <h2 className="font-display text-5xl font-bold uppercase text-white tracking-tight leading-none">
              {title}
            </h2>
          </div>
          {products.length > 12 && (
            <button
              onClick={() => onVerTodos(title)}
              className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-white/35 hover:text-[#c8a96e] transition-colors"
            >
              Ver todos <ArrowRight size={11} />
            </button>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-7">
          {shown.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              isFavorited={favs.includes(p.id)}
              onFavorite={onFavorite}
              onClick={onClick}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
