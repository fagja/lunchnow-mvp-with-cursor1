-- supabase/migrations/20250406021806_add_likes_delete_policy.sql
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "全ユーザーがいいね削除可能"
ON public.likes FOR DELETE
TO public
USING (true);
