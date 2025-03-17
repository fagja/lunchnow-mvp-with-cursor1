-- 募集中ユーザー一覧を取得するRPC関数
CREATE OR REPLACE FUNCTION public.get_recruiting_users(
  p_current_user_id BIGINT,
  p_min_recruiting_time TIMESTAMP WITH TIME ZONE,
  p_today DATE
)
RETURNS SETOF json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH liked_users AS (
    -- 当日のいいね情報を取得
    SELECT to_user_id
    FROM public.likes
    WHERE from_user_id = p_current_user_id
    AND created_at::date = p_today
  )
  SELECT json_build_object(
    'id', u.id,
    'nickname', u.nickname,
    'grade', u.grade,
    'department', u.department,
    'end_time', u.end_time,
    'place', u.place,
    'is_matched', u.is_matched,
    'recruiting_since', u.recruiting_since,
    'created_at', u.created_at,
    'updated_at', u.updated_at,
    'liked_by_me', CASE WHEN l.to_user_id IS NOT NULL THEN true ELSE false END
  )
  FROM public.users u
  LEFT JOIN liked_users l ON u.id = l.to_user_id
  WHERE 
    u.is_matched = false
    AND u.recruiting_since >= p_min_recruiting_time
    AND u.id != p_current_user_id
  ORDER BY u.recruiting_since DESC;
END;
$$;