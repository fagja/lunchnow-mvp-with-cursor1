-- サンプルユーザーデータの挿入
INSERT INTO public.users (id, email, username, avatar_url, bio, location, lunch_preferences)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'user1@example.com', 'タロウ', 'https://randomuser.me/api/portraits/men/1.jpg', '東京で働くエンジニアです。ラーメンが好きです。', '東京', '{"cuisine": ["日本食", "イタリアン"], "price_range": "中", "time_preference": "12:00-13:00"}'),
  ('00000000-0000-0000-0000-000000000002', 'user2@example.com', 'ハナコ', 'https://randomuser.me/api/portraits/women/1.jpg', 'マーケティング担当です。新しいレストランを開拓するのが趣味です。', '東京', '{"cuisine": ["イタリアン", "フレンチ"], "price_range": "中", "time_preference": "13:00-14:00"}'),
  ('00000000-0000-0000-0000-000000000003', 'user3@example.com', 'ケンジ', 'https://randomuser.me/api/portraits/men/2.jpg', 'デザイナーです。食事しながらの交流が好きです。', '東京', '{"cuisine": ["中華", "韓国料理"], "price_range": "安", "time_preference": "12:00-13:00"}'),
  ('00000000-0000-0000-0000-000000000004', 'user4@example.com', 'アキコ', 'https://randomuser.me/api/portraits/women/2.jpg', '営業部で働いています。美味しいランチスポットを探しています。', '東京', '{"cuisine": ["韓国料理", "タイ料理"], "price_range": "中", "time_preference": "13:00-14:00"}'),
  ('00000000-0000-0000-0000-000000000005', 'user5@example.com', 'ユウタ', 'https://randomuser.me/api/portraits/men/3.jpg', 'プロジェクトマネージャーです。お昼の交流を通じてネットワーキングしたいです。', '東京', '{"cuisine": ["イタリアン", "メキシカン"], "price_range": "高", "time_preference": "12:30-13:30"}');

-- サンプルいいねデータの挿入
INSERT INTO public.likes (from_user_id, to_user_id)
VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003'),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004'),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003'),
  ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002');

/* 自動的にトリガーで作成されるのでコメントアウト
INSERT INTO public.matches (user_id_1, user_id_2)
VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004');
*/

/* メッセージデータも一時的にコメントアウト
-- サンプルメッセージデータの挿入
INSERT INTO public.messages (match_id, sender_id, content)
SELECT
  m.id,
  m.user_id_1,
  'こんにちは！ランチに行きませんか？'
FROM public.matches m
WHERE m.user_id_1 = '00000000-0000-0000-0000-000000000001'
LIMIT 1;

INSERT INTO public.messages (match_id, sender_id, content)
SELECT
  m.id,
  m.user_id_2,
  'いいですね！何時がいいですか？'
FROM public.matches m
WHERE m.user_id_1 = '00000000-0000-0000-0000-000000000001'
LIMIT 1;

INSERT INTO public.messages (match_id, sender_id, content)
SELECT
  m.id,
  m.user_id_1,
  '12:30はどうですか？'
FROM public.matches m
WHERE m.user_id_1 = '00000000-0000-0000-0000-000000000001'
LIMIT 1;
*/
