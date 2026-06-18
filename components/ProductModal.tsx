"use client";
import { useEffect, useState, useCallback } from "react";
import { X, Heart, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import type { Product, ProductDetailResponse } from "@/lib/types";
import { imgProxy } from "./ProductCard";

type Props = {
  product: Product | null;
  isFavorited: boolean;
  onFavorite: (id: string) => void;
  onClose: () => void;
};

export function ProductModal({ product, isFavorited, onFavorite, onClose }: Props) {
  const [detail, setDetail] = useState<ProductDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [photoIdx, setPhotoIdx] = useState(0);

  useEffect(() => {
    if (!product) { setDetail(null); setPhotoIdx(0); return; }
    setLoading(true);
    setPhotoIdx(0);
    const qs = new URLSearchParams({ url: product.productUrl, cover: product.coverUrl });
    fetch(`/api/product/${encodeURIComponent(product.id)}?${qs}`)
      .then(r => r.json())
      .then((d: ProductDetailResponse) => setDetail(d))
      .catch(() => setDetail({ fotos: [product.coverUrl], nome: product.nome, productUrl: product.productUrl }))
      .finally(() => setLoading(false));
  }, [product]);

  const fotos = detail?.fotos ?? (product ? [product.coverUrl] : []);

  const prev = useCallback(() => setPhotoIdx(i => Math.max(i - 1, 0)), []);
  const next = useCallback(() => setPhotoIdx(i => Math.min(i + 1, fotos.length - 1)), [fotos.length]);

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  }, [onClose, next, prev]);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  if (!product) return null;

  const currentPhoto = fotos[photoIdx] ?? product.coverUrl;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/90 backdrop-blur-sm p-0 sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative bg-[#0f0f0f] border border-white/8 w-full sm:rounded-lg sm:max-w-2xl max-h-[95vh] flex flex-col sm:flex-row overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-1.5 bg-black/70 rounded-full text-white/50 hover:text-white transition-colors"
        >
          <X size={14} />
        </button>

        {/* Photo area */}
        <div className="relative w-full sm:w-[55%] aspect-square bg-[#0a0a0a] flex-shrink-0">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-5 h-5 border border-[#c8a96e] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={currentPhoto}
              src={imgProxy(currentPhoto)}
              alt={product.nome}
              className="w-full h-full object-contain"
            />
          )}

          {/* Arrows */}
          {fotos.length > 1 && !loading && (
            <>
              <button
                onClick={prev} disabled={photoIdx === 0}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/70 text-white disabled:opacity-20 hover:text-[#c8a96e] transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={next} disabled={photoIdx === fotos.length - 1}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/70 text-white disabled:opacity-20 hover:text-[#c8a96e] transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}

          {/* Thumbnails */}
          {fotos.length > 1 && !loading && (
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 px-4 overflow-x-auto scrollbar-hide">
              {fotos.slice(0, 10).map((f, i) => (
                <button
                  key={i}
                  onClick={() => setPhotoIdx(i)}
                  className={`w-9 h-9 flex-shrink-0 overflow-hidden transition-all ${
                    i === photoIdx ? "ring-1 ring-[#c8a96e] opacity-100" : "opacity-40 hover:opacity-70"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imgProxy(f)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col p-6 flex-1 overflow-y-auto min-h-0">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#c8a96e] mb-2">
            {product.categoria} · {product.albumNome}
          </p>
          <h3 className="font-display text-2xl font-bold text-white uppercase leading-tight mb-1">
            {product.nome}
          </h3>
          <p className="font-mono text-[9px] text-white/20 mb-auto">#{product.id.slice(-8)}</p>

          <div className="mt-8 space-y-2.5">
            <button
              onClick={() => onFavorite(product.id)}
              className={`w-full flex items-center justify-center gap-2 py-2.5 text-xs font-medium border transition-colors ${
                isFavorited
                  ? "border-[#c94a2a] text-[#c94a2a] bg-[#c94a2a]/8"
                  : "border-white/15 text-white/60 hover:border-[#c94a2a] hover:text-[#c94a2a]"
              }`}
            >
              <Heart size={13} className={isFavorited ? "fill-[#c94a2a]" : ""} />
              {isFavorited ? "Favoritado" : "Favoritar"}
            </button>

            {product.productUrl !== "#" && (
              <a
                href={product.productUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold bg-[#c8a96e] text-[#0a0a0a] hover:bg-white transition-colors"
              >
                <ExternalLink size={13} />
                Ver no catálogo original
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
