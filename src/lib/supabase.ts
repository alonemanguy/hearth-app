import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dtiesmtanetxhyryxzbu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aWVzbXRhbmV0eGh5cnl4emJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE3ODc5MTksImV4cCI6MjEwNzM2MzkxOX0.mrCA4eybzv_SVHZ5SJGeLUwDAb763uqlYjci6mWGuFQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);