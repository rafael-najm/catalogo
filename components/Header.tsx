"use client";
import { Search, X } from "lucide-react";
import { CATEGORIAS } from "@/config/albums";

type Props = { search: string; onSearch: (v: string) => void };

export function Header({ search, onSearch }: Props) {
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-[#0a0a0a]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-5 h-14 flex items-center gap-6">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-6 h-6 border border-[#c8a96e] flex items-center justify-center">
            <span className="font-mono text-[9px] text-[#c8a96e] font-bold leading-none">M</span>
          </div>
          <span className="font-display text-white font-semibold tracking-[0.15em] text-sm uppercase hidden sm:block">
            Manifesto
          </span>
        </a>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={e => onSearch(e.target.value)}
            placeholder="Buscar..."
            className="w-full bg-white/5 border border-white/10 rounded-sm pl-8 pr-7 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#c8a96e]/60 transition-colors"
          />
          {search && (
            <button onClick={() => onSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
              <X size={11} />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-6 ml-auto">
          {CATEGORIAS.map(c => (
            <a
              key={c}
              href={`#${c.toLowerCase()}`}
              className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40 hover:text-[#c8a96e] transition-colors"
            >
              {c}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
