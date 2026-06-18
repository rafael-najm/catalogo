import { CatalogClient } from "@/components/CatalogClient";
import { runSync } from "@/lib/sync";

// Revalida a cada 15 minutos — chama runSync() diretamente, sem fetch interno
export const revalidate = 900;

export default async function HomePage() {
  const data = await runSync();
  return <CatalogClient data={data} />;
}
