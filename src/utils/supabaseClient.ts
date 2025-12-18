import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug: verificar se as variáveis estão sendo carregadas
console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'Configurado' : 'NÃO CONFIGURADO');
console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Configurado' : 'NÃO CONFIGURADO');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env');
  throw new Error('Variáveis de ambiente do Supabase não encontradas. Verifique o arquivo .env na raiz do projeto.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


