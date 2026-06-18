"use client";

import Link from "next/link";
import { SearchBar } from "./SearchBar";

type Props = {
  search: string;
  onSearch: (v: string) => void;
};

export function Header({ search, onSearch }: Props) {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[#0b0c0f]/80 border-b border-[#2a2d35]">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0 flex items-center gap-2 group">
          <div className="w-7 h-7 border border-[#cf9d4f] rounded flex items-center justify-center">
            <span className="font-mono text-[10px] text-[#cf9d4f] font-bold">M</span>
          </div>
          <span className="font-display text-[#f3f1ec] font-bold tracking-wide text-sm hidden sm:block">
            MANIFESTO
          </span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-sm">
          <SearchBar value={search} onChange={onSearch} />
        </div>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-5 ml-auto">
          <Link href="/" className="font-mono text-[11px] uppercase tracking-widest text-[#555b6b] hover:text-[#f3f1ec] transition-colors">
            Início
          </Link>
          <Link href="#catalogo" className="font-mono text-[11px] uppercase tracking-widest text-[#555b6b] hover:text-[#f3f1ec] transition-colors">
            Catálogo
          </Link>
          <Link href="#favoritos" className="font-mono text-[11px] uppercase tracking-widest text-[#555b6b] hover:text-[#f3f1ec] transition-colors">
            Favoritos
          </Link>
        </nav>
      </div>
    </header>
  );
}
