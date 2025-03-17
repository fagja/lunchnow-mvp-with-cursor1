-- マッチングキャンセルのためのストアドプロシージャ
CREATE OR REPLACE FUNCTION cancel_match(
  p_match_id BIGINT
)
RETURNS void AS $$
DECLARE
  v_user_id_1 BIGINT;
  v_user_id_2 BIGINT;
  v_today DATE := CURRENT_DATE;
BEGIN
  -- トランザクション開始
  BEGIN
    -- マッチングレコードの存在と状態を確認
    SELECT user_id_1, user_id_2
    FROM public.matches
    WHERE id = p_match_id AND is_canceled = FALSE
    INTO v_user_id_1, v_user_id_2;

    -- マッチが存在しないか、既にキャンセル済みの場合
    IF v_user_id_1 IS NULL OR v_user_id_2 IS NULL THEN
      RAISE EXCEPTION 'マッチが見つからないか、既にキャンセルされています' USING ERRCODE = 'PGRST116';
    END IF;

    -- マッチングをキャンセル状態に更新
    UPDATE public.matches
    SET is_canceled = TRUE
    WHERE id = p_match_id;

    -- 両ユーザーのマッチング状態を更新
    UPDATE public.users
    SET
      is_matched = FALSE,
      recruiting_since = NOW()
    WHERE id IN (v_user_id_1, v_user_id_2);

    -- 両方向のいいねレコードを削除（当日分のみ）
    DELETE FROM public.likes
    WHERE (
      (from_user_id = v_user_id_1 AND to_user_id = v_user_id_2) OR
      (from_user_id = v_user_id_2 AND to_user_id = v_user_id_1)
    ) AND DATE(created_at) = v_today;

  EXCEPTION
    WHEN OTHERS THEN
      -- その他のエラー
      RAISE;
  END;
END;
$$ LANGUAGE plpgsql;
