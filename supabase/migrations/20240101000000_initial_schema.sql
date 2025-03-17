-- ユーザーテーブルの作成
CREATE TABLE public.users (
  id BIGSERIAL PRIMARY KEY,
  nickname VARCHAR(12) NOT NULL,
  grade VARCHAR(10) NOT NULL,
  department VARCHAR(50) NOT NULL,
  end_time VARCHAR(10),
  place VARCHAR(30),
  is_matched BOOLEAN NOT NULL DEFAULT false,
  recruiting_since TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) ポリシーの設定
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが全レコードを閲覧可能
CREATE POLICY "全ユーザーが閲覧可能" ON public.users
  FOR SELECT USING (true);

-- ユーザー作成・更新権限（MVPでは認証機能がないため、単純化）
CREATE POLICY "全ユーザーが作成可能" ON public.users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "全ユーザーが更新可能" ON public.users
  FOR UPDATE USING (true);

-- いいねテーブルの作成
CREATE TABLE public.likes (
  from_user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  to_user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (from_user_id, to_user_id)
);

-- ROW LEVEL SECURITY (RLS) ポリシーの設定
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- 全ユーザーがいいね情報を閲覧・作成可能（MVPでは単純化）
CREATE POLICY "全ユーザーがいいね閲覧可能" ON public.likes
  FOR SELECT USING (true);

CREATE POLICY "全ユーザーがいいね作成可能" ON public.likes
  FOR INSERT WITH CHECK (true);

-- マッチテーブルの作成
CREATE TABLE public.matches (
  id BIGSERIAL PRIMARY KEY,
  user_id_1 BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user_id_2 BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  is_canceled BOOLEAN NOT NULL DEFAULT false
);

-- 1ユーザー1マッチ制約を実装（アクティブなマッチのみ）
CREATE UNIQUE INDEX unique_active_match_user1
  ON public.matches(user_id_1)
  WHERE is_canceled = false;

CREATE UNIQUE INDEX unique_active_match_user2
  ON public.matches(user_id_2)
  WHERE is_canceled = false;

-- アクティブなマッチのみを対象としたユニーク制約
CREATE UNIQUE INDEX unique_active_match_pair
  ON public.matches(
    LEAST(user_id_1, user_id_2),
    GREATEST(user_id_1, user_id_2)
  )
  WHERE is_canceled = false;

-- ROW LEVEL SECURITY (RLS) ポリシーの設定
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- 全ユーザーがマッチ情報を閲覧・作成可能（MVPでは単純化）
CREATE POLICY "全ユーザーがマッチ閲覧可能" ON public.matches
  FOR SELECT USING (true);

CREATE POLICY "全ユーザーがマッチ作成可能" ON public.matches
  FOR INSERT WITH CHECK (true);

CREATE POLICY "全ユーザーがマッチ更新可能" ON public.matches
  FOR UPDATE USING (true);

-- メッセージテーブルの作成
CREATE TABLE public.messages (
  id BIGSERIAL PRIMARY KEY,
  match_id BIGINT NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  from_user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) ポリシーの設定
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 全ユーザーがメッセージを閲覧・作成可能（MVPでは単純化）
CREATE POLICY "全ユーザーがメッセージ閲覧可能" ON public.messages
  FOR SELECT USING (true);

CREATE POLICY "全ユーザーがメッセージ作成可能" ON public.messages
  FOR INSERT WITH CHECK (true);

-- トリガー関数: 更新時のタイムスタンプを自動更新
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_update_timestamp
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- トリガー関数: マッチ登録時のユーザーステータス更新
CREATE OR REPLACE FUNCTION update_user_match_status()
RETURNS TRIGGER AS $$
BEGIN
  -- マッチングに関わる両ユーザーのis_matchedをtrueに更新
  UPDATE public.users
  SET is_matched = TRUE
  WHERE id IN (NEW.user_id_1, NEW.user_id_2) AND is_matched = FALSE;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_match_status
AFTER INSERT ON public.matches
FOR EACH ROW
EXECUTE FUNCTION update_user_match_status();

-- トリガー関数: マッチキャンセル時のユーザーステータス更新
CREATE OR REPLACE FUNCTION update_user_match_status_on_cancel()
RETURNS TRIGGER AS $$
BEGIN
  -- キャンセルされたマッチの場合のみ処理
  IF NEW.is_canceled = TRUE AND OLD.is_canceled = FALSE THEN
    -- 他にアクティブなマッチがないユーザーのis_matchedをfalseに更新
    UPDATE public.users u
    SET is_matched = FALSE
    WHERE u.id IN (NEW.user_id_1, NEW.user_id_2)
    AND NOT EXISTS (
      SELECT 1 FROM public.matches m
      WHERE m.is_canceled = FALSE
      AND m.id != NEW.id
      AND (
        m.user_id_1 = u.id
        OR m.user_id_2 = u.id
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_match_status_on_cancel
AFTER UPDATE ON public.matches
FOR EACH ROW
EXECUTE FUNCTION update_user_match_status_on_cancel();
