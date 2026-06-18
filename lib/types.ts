import type { Categoria } from "@/config/albums";

export type Product = {
  id: string;
  nome: string;
  categoria: Categoria;
  albumNome: string;
  albumUrl: string;
  coverUrl: string;
  productUrl: string;
};

export type SyncResponse = {
  produtos: Product[];
  demoMode?: boolean;
  erros?: string[];
  cachedAt: string;
};

export type ProductDetailResponse = {
  fotos: string[];
  nome: string;
  productUrl: string;
};
