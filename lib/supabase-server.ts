import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client using service role key.
// This bypasses RLS and should ONLY be used in server-side code (API routes, server actions).
// Never import this file from client components.
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = createClient(
  supabaseUrl,
  // Fall back to anon key if service role key is not yet configured,
  // but log a warning so the developer knows to set it up.
  supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: { persistSession: false },
  }
);

if (!supabaseServiceKey) {
  console.warn(
    "[SECURITY] SUPABASE_SERVICE_ROLE_KEY is not set. " +
    "Server-side Supabase operations are falling back to the anon key. " +
    "Set SUPABASE_SERVICE_ROLE_KEY in your .env for production."
  );
}
