-- サンプルユーザーデータの挿入
INSERT INTO public.users (id, nickname, grade, department, end_time, place, is_matched, recruiting_since)
VALUES
  (1, 'タロウ', '3年', '経済学部', '~13:00', '学食', false, NOW() - INTERVAL '5 minutes'),
  (2, 'ハナコ', '2年', '商学部', '~12:30', '購買', false, NOW() - INTERVAL '10 minutes'),
  (3, 'ケンジ', '4年', '理工学部', '~13:30', 'キッチンカー', false, NOW() - INTERVAL '15 minutes'),
  (4, 'アキコ', '1年', '文学部', '~12:00', 'コンビニ', false, NOW() - INTERVAL '8 minutes'),
  (5, 'ユウタ', '3年', '総合政策学部', '~14:00', 'ひよ裏（駅周辺）', false, NOW() - INTERVAL '3 minutes');

-- サンプルいいねデータの挿入
INSERT INTO public.likes (from_user_id, to_user_id)
VALUES
  (1, 3),
  (3, 4),
  (4, 3),
  (5, 2);

-- 最初のテスト用にマッチを手動で作成
INSERT INTO public.matches (user_id_1, user_id_2)
VALUES
  (1, 2);

-- ユーザー1と2をマッチ状態に更新
UPDATE public.users
SET is_matched = true
WHERE id IN (1, 2);

-- サンプルメッセージデータの挿入
INSERT INTO public.messages (match_id, from_user_id, content)
VALUES
  (1, 1, 'こんにちは！ランチに行きませんか？'),
  (1, 2, 'いいですね！何時がいいですか？'),
  (1, 1, '12:30はどうですか？');
