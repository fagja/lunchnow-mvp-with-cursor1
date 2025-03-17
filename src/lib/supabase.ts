import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 環境変数が設定されているか確認
if (!supabaseUrl) {
  console.error('環境変数 NEXT_PUBLIC_SUPABASE_URL が設定されていません');
}

if (!supabaseAnonKey) {
  console.error('環境変数 NEXT_PUBLIC_SUPABASE_ANON_KEY が設定されていません');
}

export const supabase = createClient<Database>(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

export default supabase;
