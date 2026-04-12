import { createClient } from "@supabase/supabase-js";
import { ENV } from "./env";

// Server-side Supabase client with service role key (bypasses RLS)
export const supabaseAdmin = createClient(
  ENV.supabaseUrl,
  ENV.supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Create a Supabase client scoped to a user's JWT
export function createSupabaseClient(accessToken?: string) {
  return createClient(ENV.supabaseUrl, ENV.supabaseAnonKey, {
    global: {
      headers: accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : {},
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
