-- ユーザーテーブルの作成
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  lunch_preferences JSONB,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) ポリシーの設定
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが全レコードを閲覧可能
CREATE POLICY "全ユーザーが閲覧可能" ON public.users
  FOR SELECT USING (true);

-- 匿名ユーザーがレコード作成可能（サインアップ時）
CREATE POLICY "匿名ユーザーが作成可能" ON public.users
  FOR INSERT WITH CHECK (auth.role() = 'anon');

-- ユーザーは自分のレコードのみ更新可能
CREATE POLICY "ユーザーは自分のレコードのみ更新可能" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- いいねテーブルの作成
CREATE TABLE public.likes (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  from_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  to_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  UNIQUE (from_user_id, to_user_id)
);

-- ROW LEVEL SECURITY (RLS) ポリシーの設定
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分が送信または受信したいいねのみ閲覧可能
CREATE POLICY "ユーザーは自分のいいねのみ閲覧可能" ON public.likes
  FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- ユーザーは自分がいいねを送信可能
CREATE POLICY "ユーザーはいいね送信可能" ON public.likes
  FOR INSERT WITH CHECK (auth.uid() = from_user_id);

-- マッチテーブルの作成
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id_1 UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  user_id_2 UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  UNIQUE (user_id_1, user_id_2)
);

-- ROW LEVEL SECURITY (RLS) ポリシーの設定
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のマッチのみ閲覧可能
CREATE POLICY "ユーザーは自分のマッチのみ閲覧可能" ON public.matches
  FOR SELECT USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

-- メッセージテーブルの作成
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE
);

-- ROW LEVEL SECURITY (RLS) ポリシーの設定
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のマッチに関連するメッセージのみ閲覧可能
CREATE POLICY "ユーザーは自分のメッセージのみ閲覧可能" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.matches
      WHERE id = messages.match_id
        AND (user_id_1 = auth.uid() OR user_id_2 = auth.uid())
    )
  );

-- ユーザーは自分のメッセージのみ作成可能
CREATE POLICY "ユーザーは自分のメッセージのみ作成可能" ON public.messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1
      FROM public.matches
      WHERE id = match_id
        AND (user_id_1 = auth.uid() OR user_id_2 = auth.uid())
    )
  );

/* トリガー部分を一時的にコメントアウト
-- トリガー関数: 相互いいねでマッチを自動作成
CREATE OR REPLACE FUNCTION create_match_on_mutual_like()
RETURNS TRIGGER AS $$
DECLARE
  reverse_like_exists BOOLEAN;
BEGIN
  -- 相互いいねの確認
  SELECT EXISTS(
    SELECT 1
    FROM public.likes
    WHERE from_user_id = NEW.to_user_id AND to_user_id = NEW.from_user_id
  ) INTO reverse_like_exists;

  -- 相互いいねが存在する場合、マッチを作成
  IF reverse_like_exists THEN
    -- ユーザーIDを昇順にする（重複を避けるため）
    IF NEW.from_user_id < NEW.to_user_id THEN
      INSERT INTO public.matches (user_id_1, user_id_2)
      VALUES (NEW.from_user_id, NEW.to_user_id);
    ELSE
      INSERT INTO public.matches (user_id_1, user_id_2)
      VALUES (NEW.to_user_id, NEW.from_user_id);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- いいね時のトリガーを設定
CREATE TRIGGER trigger_create_match_on_mutual_like
AFTER INSERT ON public.likes
FOR EACH ROW
EXECUTE FUNCTION create_match_on_mutual_like();
*/
