-- ランチマッチングアプリ「LunchNow」用シードデータ
-- MVPテスト用にサンプルデータを提供します

-- サンプルユーザーデータの挿入
-- 異なる学年・学部と多様な空き時間・場所を設定
INSERT INTO public.users (id, nickname, grade, department, end_time, place, is_matched, recruiting_since)
VALUES
  (1, 'タロウ', '3年', '経済学部', '~13:00', '学食', false, NOW() - INTERVAL '5 minutes'),
  (2, 'ハナコ', '2年', '商学部', '~12:30', '購買', false, NOW() - INTERVAL '10 minutes'),
  (3, 'ケンジ', '4年', '理工学部', '~13:30', 'キッチンカー', false, NOW() - INTERVAL '15 minutes'),
  (4, 'アキコ', '1年', '文学部', '~12:00', 'コンビニ', false, NOW() - INTERVAL '8 minutes'),
  (5, 'ユウタ', '3年', '総合政策学部', '~14:00', 'ひよ裏（駅周辺）', false, NOW() - INTERVAL '3 minutes'),
  (6, 'マリコ', '2年', '法学部', '~13:30', '生協', false, NOW() - INTERVAL '7 minutes'),
  (7, 'ダイキ', '1年', '医学部', '~12:00', '学食', false, NOW() - INTERVAL '12 minutes');

-- サンプルいいねデータの挿入
-- 様々なケースをテスト：相互いいね、片方向いいね
INSERT INTO public.likes (from_user_id, to_user_id)
VALUES
  -- ユーザー間のいいね関係
  (1, 3), -- タロウ → ケンジ
  (3, 4), -- ケンジ → アキコ
  (4, 3), -- アキコ → ケンジ（相互いいね）
  (5, 2), -- ユウタ → ハナコ
  (6, 5), -- マリコ → ユウタ
  (5, 6), -- ユウタ → マリコ（相互いいね）
  (7, 1); -- ダイキ → タロウ

-- マッチデータの作成
-- テスト用の既存マッチ
INSERT INTO public.matches (id, user_id_1, user_id_2, is_canceled)
VALUES
  (1, 1, 2, false),   -- タロウ＆ハナコ：アクティブなマッチ
  (2, 3, 4, false),   -- ケンジ＆アキコ：相互いいねからのマッチ
  (3, 5, 6, false),   -- ユウタ＆マリコ：相互いいねからのマッチ
  (4, 4, 7, true);    -- アキコ＆ダイキ：キャンセル済みマッチ

-- ユーザーのマッチ状態を更新
UPDATE public.users
SET is_matched = true
WHERE id IN (1, 2, 3, 4, 5, 6);

-- サンプルメッセージデータの挿入
INSERT INTO public.messages (match_id, from_user_id, content, created_at)
VALUES
  -- タロウ＆ハナコの会話（matchId=1）
  (1, 1, 'こんにちは！ランチに行きませんか？', NOW() - INTERVAL '30 minutes'),
  (1, 2, 'いいですね！何時がいいですか？', NOW() - INTERVAL '28 minutes'),
  (1, 1, '12:30はどうですか？', NOW() - INTERVAL '25 minutes'),
  (1, 2, 'はい、大丈夫です。購買の前で会いましょう', NOW() - INTERVAL '23 minutes'),
  (1, 1, '了解です！', NOW() - INTERVAL '20 minutes'),

  -- ケンジ＆アキコの会話（matchId=2）
  (2, 3, 'ランチ一緒にどうですか？', NOW() - INTERVAL '15 minutes'),
  (2, 4, '喜んで！どこがいいですか？', NOW() - INTERVAL '13 minutes'),
  (2, 3, 'キッチンカーはどうですか？', NOW() - INTERVAL '10 minutes'),
  (2, 4, 'いいですね！', NOW() - INTERVAL '8 minutes'),

  -- ユウタ＆マリコの会話（新しいマッチ・メッセージなし）
  (3, 5, 'はじめまして、ランチご一緒しませんか？', NOW() - INTERVAL '5 minutes');

-- シードデータの挿入が完了しました
-- このデータを使用して、様々なマッチングシナリオとチャット履歴のテストが可能です
