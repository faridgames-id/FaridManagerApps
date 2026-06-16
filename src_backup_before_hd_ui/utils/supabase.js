import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vneeugjoqtdlldtylddt.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuZWV1Z2pvcXRkbGxkdHlsZGR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzOTQ3MDcsImV4cCI6MjA5NTk3MDcwN30.jb4E8XThylj_X9-LOOIXgV9yneVg644mWSMH_n8IoeQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
