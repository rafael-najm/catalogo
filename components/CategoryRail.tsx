"use client";

import { CATEGORIAS, type Categoria } from "@/config/albums";

type Props = {
  selected: Categoria | null;
  onChange: (c: Categoria | null) => void;
};

export function CategoryRail({ selected, onChange }: Props) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
      <Chip label="Todos" active={selected === null} onClick={() => onChange(null)} />
      {CATEGORIAS.map((cat) => (
        <Chip key={cat} label={cat} active={selected === cat} onClick={() => onChange(cat)} />
      ))}
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 font-mono text-[11px] uppercase tracking-widest px-3 py-1.5 rounded border transition-colors ${
        active
          ? "border-[#cf9d4f] text-[#cf9d4f] bg-[#cf9d4f]/10"
          : "border-[#2a2d35] text-[#555b6b] hover:border-[#cf9d4f]/50 hover:text-[#f3f1ec]"
      }`}
    >
      {label}
    </button>
  );
}
