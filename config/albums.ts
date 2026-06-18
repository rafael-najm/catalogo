export type Categoria = "Tênis" | "Bolsas" | "Roupas" | "Infantil" | "Luxo";

export type Album = {
  nome: string;
  url: string;
  senha?: string;
  categoria: Categoria;
};

export const ALBUMS: Album[] = [
  // Tênis
  { nome: "Funny1",       url: "https://funny1.x.yupoo.com/albums",                        categoria: "Tênis" },
  { nome: "EU1688",       url: "https://eu1688.x.yupoo.com/albums",                        categoria: "Tênis" },
  { nome: "1998Shoe",     url: "https://1998shoe.x.yupoo.com/albums",   senha: "HJH001077", categoria: "Tênis" },
  { nome: "Sneakerheads", url: "https://sneakerheads.x.yupoo.com/albums", senha: "888888",  categoria: "Tênis" },
  { nome: "Hongxin1",     url: "https://x.yupoo.com/photos/hongxin1/albums", senha: "111111", categoria: "Tênis" },
  { nome: "791737999",    url: "https://x.yupoo.com/photos/791737999/albums", senha: "666666", categoria: "Tênis" },
  { nome: "AJ-Dongli",   url: "https://aj-dongli.x.yupoo.com/albums",   senha: "112288",   categoria: "Tênis" },
  // Infantil
  { nome: "Xiaochen3344", url: "https://x.yupoo.com/photos/xiaochen3344/albums",           categoria: "Infantil" },
  // Luxo
  { nome: "Baisitexieye", url: "https://baisitexieye.x.yupoo.com/albums", senha: "666888", categoria: "Luxo" },
  { nome: "GHXY",         url: "https://ghxy.x.yupoo.com/albums",                          categoria: "Luxo" },
  // Qiqiyg usa domínio próprio fora do padrão *.x.yupoo.com — pode precisar de parser separado
  { nome: "Qiqiyg",       url: "http://qiqiyg.com/defaulten.html",                         categoria: "Luxo" },
  // Roupas
  { nome: "Mujichaopaia", url: "https://mujichaopaia.x.yupoo.com/albums",                  categoria: "Roupas" },
  { nome: "Linger1988",   url: "https://x.yupoo.com/photos/linger1988/albums",             categoria: "Roupas" },
  { nome: "407131796",    url: "https://407131796.x.yupoo.com/albums",                     categoria: "Roupas" },
  // Shoes Qiqiyg usa domínio próprio idem acima
  { nome: "Shoes Qiqiyg", url: "http://shoes.qiqiyg.com/albums",                           categoria: "Roupas" },
  // Bolsas
  { nome: "Bag001",       url: "https://bag001.x.yupoo.com/albums",      senha: "888999",  categoria: "Bolsas" },
  // Categorias (formato /categories/NNN — parser separado no sync)
  { nome: "Yolo66",        url: "https://yolo66.x.yupoo.com/categories/4649419?page=1",       categoria: "Tênis" },
  { nome: "Deshengxing",   url: "https://deshengxing.x.yupoo.com/categories/4161021?page=2",  categoria: "Tênis" },
];

export const CATEGORIAS: Categoria[] = ["Tênis", "Bolsas", "Roupas", "Infantil", "Luxo"];
