// シーケンスをリセットするスクリプト
import { createClient } from '@supabase/supabase-js';

async function resetSequences() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('ユーザーIDシーケンスをリセットしています...');
    
    // users_id_seqをリセット
    const { data: usersData, error: usersError } = await supabase.rpc(
      'exec_sql', 
      { sql: "SELECT setval('public.users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM public.users), true)" }
    );
    
    if (usersError) {
      console.error('ユーザーシーケンスリセットエラー:', usersError);
    } else {
      console.log('ユーザーシーケンスリセット成功');
    }
    
    // matches_id_seqをリセット
    const { data: matchesData, error: matchesError } = await supabase.rpc(
      'exec_sql', 
      { sql: "SELECT setval('public.matches_id_seq', (SELECT COALESCE(MAX(id), 1) FROM public.matches), true)" }
    );
    
    if (matchesError) {
      console.error('マッチングシーケンスリセットエラー:', matchesError);
    } else {
      console.log('マッチングシーケンスリセット成功');
    }
    
    console.log('すべてのシーケンスリセット完了');
  } catch (err) {
    console.error('例外が発生しました:', err);
  }
}

resetSequences();