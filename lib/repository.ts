import { type Dataset, type DrugRecord } from "@/lib/data";

export type RepositoryResult<T> = { data: T; source: "supabase"; error?: never } | { data: null; source: "supabase"; error: string };

export interface DrugRepository {
  list(dataset: Dataset): Promise<RepositoryResult<DrugRecord[]>>;
  find(dataset: Dataset, id: string): Promise<RepositoryResult<DrugRecord | null>>;
}

export function supabaseConfigurationStatus() {
  return { configured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY), mode: "production" as const };
}
