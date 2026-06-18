"use client";
import { useState } from "react";
import { Heart } from "lucide-react";
import type { Product } from "@/lib/types";

export function imgProxy(url: string) {
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
  const [coverSrc, setCoverSrc] = useState(() =>
    product.coverUrl && product.coverUrl !== "/placeholder.jpg" ? imgProxy(product.coverUrl) : ""
  );
  const [failed, setFailed] = useState(false);

  function handleError() {
    if (failed) return;
    setFailed(true);
    const qs = new URLSearchParams({ url: product.productUrl, cover: product.coverUrl });
    fetch(`/api/product/${encodeURIComponent(product.id)}?${qs}`)
      .then(r => r.json())
      .then((d: { fotos?: string[] }) => {
        const alt = (d.fotos ?? []).find(f => f !== product.coverUrl && f !== "/placeholder.jpg");
        if (alt) { setCoverSrc(imgProxy(alt)); setFailed(false); }
      })
      .catch(() => {});
  }

  return (
    <div className="group cursor-pointer" onClick={() => onClick(product)}>
      {/* Image */}
      <div className="relative aspect-square bg-[#111] overflow-hidden rounded-sm mb-2.5">
        {coverSrc && !failed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={coverSrc}
            src={coverSrc}
            alt={product.nome}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            onError={handleError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-mono text-[9px] text-white/15 uppercase tracking-widest">—</span>
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
        {/* Favorite */}
        <button
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full bg-black/60 backdrop-blur-sm"
          onClick={e => { e.stopPropagation(); onFavorite(product.id); }}
          aria-label="Favoritar"
        >
          <Heart size={12} className={isFavorited ? "fill-[#c94a2a] text-[#c94a2a]" : "text-white/70"} />
        </button>
        {/* Favorited indicator (always visible) */}
        {isFavorited && (
          <div className="absolute top-2 right-2 group-hover:opacity-0 transition-opacity p-1.5 rounded-full bg-black/60">
            <Heart size={12} className="fill-[#c94a2a] text-[#c94a2a]" />
          </div>
        )}
      </div>
      {/* Info */}
      <p className="text-white/80 text-xs font-medium truncate leading-tight">{product.nome}</p>
      <p className="font-mono text-[9px] text-white/25 uppercase tracking-widest mt-0.5">{product.albumNome}</p>
    </div>
  );
}
