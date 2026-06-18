"use client";

import { useEffect, useState, useCallback } from "react";
import { X, Heart, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/lib/types";
import type { ProductDetailResponse } from "@/lib/types";

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
    if (!product) {
      setDetail(null);
      setPhotoIdx(0);
      return;
    }
    setLoading(true);
    setPhotoIdx(0);
    fetch(`/api/product/${encodeURIComponent(product.id)}?url=${encodeURIComponent(product.productUrl)}`)
      .then((r) => r.json())
      .then((d: ProductDetailResponse) => setDetail(d))
      .catch(() => setDetail({ fotos: [product.coverUrl], nome: product.nome, productUrl: product.productUrl }))
      .finally(() => setLoading(false));
  }, [product]);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && detail) setPhotoIdx((i) => Math.min(i + 1, detail.fotos.length - 1));
      if (e.key === "ArrowLeft") setPhotoIdx((i) => Math.max(i - 1, 0));
    },
    [onClose, detail]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  if (!product) return null;

  const fotos = detail?.fotos ?? [product.coverUrl];
  const currentPhoto = fotos[photoIdx] ?? product.coverUrl;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-[#15171c] border border-[#2a2d35] rounded-xl overflow-hidden w-full max-w-3xl max-h-[90vh] flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-[#0b0c0f]/80 border border-[#2a2d35] hover:border-[#cf9d4f] text-[#f3f1ec]"
          onClick={onClose}
        >
          <X size={16} />
        </button>

        {/* Photo area */}
        <div className="relative w-full md:w-1/2 aspect-square bg-[#0b0c0f] flex-shrink-0">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-[#cf9d4f] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentPhoto}
                alt={product.nome}
                className="w-full h-full object-contain"
                loading="lazy"
              />
              {/* Navigation arrows */}
              {fotos.length > 1 && (
                <>
                  <button
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-[#0b0c0f]/80 border border-[#2a2d35] text-[#f3f1ec] disabled:opacity-30"
                    onClick={() => setPhotoIdx((i) => Math.max(i - 1, 0))}
                    disabled={photoIdx === 0}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-[#0b0c0f]/80 border border-[#2a2d35] text-[#f3f1ec] disabled:opacity-30"
                    onClick={() => setPhotoIdx((i) => Math.min(i + 1, fotos.length - 1))}
                    disabled={photoIdx === fotos.length - 1}
                  >
                    <ChevronRight size={16} />
                  </button>
                  {/* Dots */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                    {fotos.map((_, i) => (
                      <button
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${i === photoIdx ? "bg-[#cf9d4f]" : "bg-[#2a2d35]"}`}
                        onClick={() => setPhotoIdx(i)}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Info area */}
        <div className="flex flex-col p-6 flex-1 overflow-y-auto">
          {/* Tag strip */}
          <div className="border border-dashed border-[#2a2d35] rounded px-3 py-2 mb-4">
            <div className="font-mono text-[10px] uppercase tracking-widest text-[#cf9d4f] mb-0.5">
              {product.categoria}
            </div>
            <div className="font-mono text-[10px] text-[#555b6b]">{product.albumNome}</div>
          </div>

          <h2 className="text-[#f3f1ec] text-xl font-bold leading-tight mb-2">{product.nome}</h2>
          <p className="font-mono text-[10px] text-[#555b6b] mb-6 uppercase">#{product.id.slice(-8)}</p>

          <div className="mt-auto space-y-3">
            <button
              onClick={() => onFavorite(product.id)}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                isFavorited
                  ? "border-[#d6552f] text-[#d6552f] bg-[#d6552f]/10"
                  : "border-[#2a2d35] text-[#f3f1ec] hover:border-[#d6552f] hover:text-[#d6552f]"
              }`}
            >
              <Heart size={14} className={isFavorited ? "fill-[#d6552f]" : ""} />
              {isFavorited ? "Favoritado" : "Favoritar"}
            </button>

            {product.productUrl !== "#" && (
              <a
                href={product.productUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#cf9d4f] text-[#0b0c0f] text-sm font-semibold hover:bg-[#eccb8e] transition-colors"
              >
                <ExternalLink size={14} />
                Ver no catálogo original
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
