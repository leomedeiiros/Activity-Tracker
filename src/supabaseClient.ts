// src/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// Use suas chaves e URL do projeto Supabase
// Idealmente, configure-as em variáveis de ambiente para não expor chaves sensíveis
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
