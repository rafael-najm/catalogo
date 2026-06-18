"use client";

import { Heart } from "lucide-react";
import type { Product } from "@/lib/types";

function imgProxy(url: string) {
  if (!url || url === "/placeholder.jpg" || url === "#") return url;
  return `/api/img?url=${encodeURIComponent(url)}`;
}

type Props = {
  product: Product;
  isFavorited: boolean;
  onFavorite: (id: string) => void;
  onClick: (product: Product) => void;
};

export function ProductCard({ product, isFavorited, onFavorite, onClick }: Props) {
  return (
    <div
      className="group relative bg-[#15171c] border border-[#2a2d35] rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:border-[#cf9d4f] hover:shadow-[0_0_20px_rgba(207,157,79,0.1)] hover:-translate-y-0.5"
      onClick={() => onClick(product)}
    >
      {/* Tag strip */}
      <div className="border-b border-dashed border-[#2a2d35] px-3 py-1.5 flex justify-between items-center bg-[#0f1115]">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[#cf9d4f]">
          {product.categoria}
        </span>
        <span className="font-mono text-[10px] text-[#555b6b] truncate max-w-[100px]">
          {product.albumNome}
        </span>
      </div>

      {/* Cover image */}
      <div className="relative aspect-square overflow-hidden bg-[#0b0c0f]">
        {product.coverUrl && product.coverUrl !== "/placeholder.jpg" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imgProxy(product.coverUrl)}
            alt={product.nome}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-mono text-[10px] text-[#2a2d35] uppercase tracking-widest">
              sem foto
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-[#f3f1ec] text-sm font-medium truncate leading-snug">{product.nome}</p>
        <p className="font-mono text-[10px] text-[#555b6b] mt-0.5 uppercase tracking-wider">
          #{product.id.slice(-6)}
        </p>
      </div>

      {/* Favorite button */}
      <button
        className="absolute top-10 right-2 p-1.5 rounded-full bg-[#0b0c0f]/80 backdrop-blur-sm border border-[#2a2d35] transition-colors hover:border-[#d6552f] group/fav"
        onClick={(e) => {
          e.stopPropagation();
          onFavorite(product.id);
        }}
        aria-label={isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      >
        <Heart
          size={13}
          className={isFavorited ? "fill-[#d6552f] text-[#d6552f]" : "text-[#555b6b] group-hover/fav:text-[#d6552f]"}
        />
      </button>
    </div>
  );
}
