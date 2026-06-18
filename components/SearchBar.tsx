"use client";

import { Search, X } from "lucide-react";

type Props = {
  value: string;
  onChange: (v: string) => void;
};

export function SearchBar({ value, onChange }: Props) {
  return (
    <div className="relative">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555b6b]" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar produto..."
        className="w-full bg-[#15171c] border border-[#2a2d35] rounded-lg pl-9 pr-8 py-2 text-sm text-[#f3f1ec] placeholder:text-[#555b6b] focus:outline-none focus:border-[#cf9d4f] transition-colors"
      />
      {value && (
        <button
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#555b6b] hover:text-[#f3f1ec]"
          onClick={() => onChange("")}
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}
