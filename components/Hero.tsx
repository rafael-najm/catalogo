type Props = { totalProdutos: number };

export function Hero({ totalProdutos }: Props) {
  return (
    <section className="pt-28 pb-16 max-w-7xl mx-auto px-5">
      <div className="border-l-2 border-[#c8a96e] pl-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#c8a96e] mb-4">
          Catálogo verificado · {totalProdutos} produtos
        </p>
        <h1 className="font-display text-[clamp(3.5rem,10vw,8rem)] font-bold uppercase leading-[0.9] text-white tracking-tight">
          Mani<br />festo
        </h1>
        <p className="mt-5 text-white/35 text-sm max-w-xs leading-relaxed">
          Produtos diretos de múltiplos fornecedores. Curadoria em tempo real.
        </p>
      </div>
    </section>
  );
}
