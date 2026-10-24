import { demoRecords, type Dataset, type DrugRecord } from "@/lib/data";

export type RepositoryResult<T> = { data: T; source: "demo" | "supabase"; error?: never } | { data: null; source: "demo" | "supabase"; error: string };

export interface DrugRepository {
  list(dataset: Dataset): Promise<RepositoryResult<DrugRecord[]>>;
  find(dataset: Dataset, id: string): Promise<RepositoryResult<DrugRecord | null>>;
}

/**
 * Safe default until the supplied Supabase project, schema, and RLS policies are reviewed.
 * It deliberately returns illustrative records and never implies that private data is connected.
 */
export const demoDrugRepository: DrugRepository = {
  async list(dataset) { return { data: demoRecords.filter((record) => record.dataset === dataset), source: "demo" }; },
  async find(dataset, id) { return { data: demoRecords.find((record) => record.dataset === dataset && record.id === id) ?? null, source: "demo" }; }
};

export function supabaseConfigurationStatus() {
  return { configured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY), mode: "demo-until-schema-review" as const };
}
