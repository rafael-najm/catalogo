export type Categoria = "Tênis" | "Roupas" | "Luxo" | "Birken";

export type Album = {
  nome: string;
  url: string;
  senha?: string;
  categoria: Categoria;
};

export const ALBUMS: Album[] = [
  { nome: "Funny1",      url: "https://funny1.x.yupoo.com/albums",                                    categoria: "Tênis"  },
  { nome: "407131796",   url: "https://407131796.x.yupoo.com/albums",                                 categoria: "Roupas" },
  { nome: "GHXY",        url: "https://ghxy.x.yupoo.com/albums",                                      categoria: "Luxo"   },
  { nome: "Yolo66",      url: "https://yolo66.x.yupoo.com/categories/4649419?page=1",                 categoria: "Birken" },
  { nome: "Deshengxing", url: "https://deshengxing.x.yupoo.com/categories/4161021?page=2",            categoria: "Birken" },
];

export const CATEGORIAS: Categoria[] = ["Tênis", "Birken", "Roupas", "Luxo"];

