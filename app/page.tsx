import { CatalogClient } from "@/components/CatalogClient";
import type { SyncResponse } from "@/lib/types";

export const revalidate = 900;

async function getSyncData(): Promise<SyncResponse> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/sync`, {
      next: { revalidate: 900 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch {
    return {
      produtos: [],
      demoMode: true,
      cachedAt: new Date().toISOString(),
    };
  }
}

export default async function HomePage() {
  const data = await getSyncData();
  return <CatalogClient data={data} />;
}
