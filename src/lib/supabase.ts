import { createClient } from '@supabase/supabase-js';

// Both values are client side and ship inside the bundle. The Supabase anon key
// is a public credential, so it is not a secret; Row Level Security in the
// database is what protects user data. The service role key must never appear
// here or anywhere else in the client.
//
// Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to run against your own
// project. The fallbacks below are Hearth's public demo instance.
export const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ?? 'https://dtiesmtanetxhyryxzbu.supabase.co';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aWVzbXRhbmV0eGh5cnl4emJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE3ODc5MTksImV4cCI6MjEwNzM2MzkxOX0.mrCA4eybzv_SVHZ5SJGeLUwDAb763uqlYjci6mWGuFQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
