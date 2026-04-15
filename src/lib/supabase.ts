import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Prevent crash if keys are missing or placeholders
const isConfigured = supabaseUrl && supabaseAnonKey && !supabaseUrl.includes("your_");

export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as any); // Fallback for development without keys

