import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _serviceClient: SupabaseClient | null = null;
export const SERVICE_SUPABASE_ENV_ERROR =
  "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set";

export function hasServiceSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export function getServiceClient(): SupabaseClient {
  if (!_serviceClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      throw new Error(SERVICE_SUPABASE_ENV_ERROR);
    }
    _serviceClient = createClient(url, serviceKey);
  }
  return _serviceClient;
}
