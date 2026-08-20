import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

export const createAdminClient = () => {
  return createSupabaseClient(supabaseUrl!, supabaseSecretKey!);
};