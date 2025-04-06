-- supabase/migrations/20250406021806_add_likes_delete_policy.sql
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to delete likes"
ON public.likes FOR DELETE
TO authenticated
USING (true);
