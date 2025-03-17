-- 相互いいね判定とマッチング登録のためのストアドプロシージャ
CREATE OR REPLACE FUNCTION create_match(
  p_user_id_1 BIGINT,
  p_user_id_2 BIGINT
)
RETURNS json AS $$
DECLARE
  v_match_id BIGINT;
  v_match_data RECORD;
  v_today DATE := CURRENT_DATE;
  v_mutual_like BOOLEAN := FALSE;
BEGIN
  -- トランザクション開始
  BEGIN
    -- 相互いいね（両方が当日にLikeしているか）を確認
    SELECT EXISTS (
      SELECT 1
      FROM public.likes a
      JOIN public.likes b ON a.from_user_id = b.to_user_id AND a.to_user_id = b.from_user_id
      WHERE a.from_user_id = p_user_id_1
      AND a.to_user_id = p_user_id_2
      AND b.from_user_id = p_user_id_2
      AND b.to_user_id = p_user_id_1
      AND DATE(a.created_at) = v_today
      AND DATE(b.created_at) = v_today
    ) INTO v_mutual_like;

    -- 相互いいねがない場合はNULLを返す
    IF NOT v_mutual_like THEN
      RETURN NULL;
    END IF;

    -- マッチングレコードを作成
    INSERT INTO public.matches(user_id_1, user_id_2)
    VALUES (
      LEAST(p_user_id_1, p_user_id_2),
      GREATEST(p_user_id_1, p_user_id_2)
    )
    RETURNING id INTO v_match_id;

    -- マッチデータを取得
    SELECT * FROM public.matches
    WHERE id = v_match_id
    INTO v_match_data;

    -- 完了
    RETURN json_build_object(
      'id', v_match_data.id,
      'user_id_1', v_match_data.user_id_1,
      'user_id_2', v_match_data.user_id_2,
      'created_at', v_match_data.created_at,
      'is_canceled', v_match_data.is_canceled
    );
  EXCEPTION
    WHEN unique_violation THEN
      -- ユニーク制約違反（既にマッチング中など）
      RAISE EXCEPTION 'ユニーク制約違反: 既にマッチングが存在しています' USING ERRCODE = '23505';
    WHEN OTHERS THEN
      -- その他のエラー
      RAISE;
  END;
END;
$$ LANGUAGE plpgsql;
