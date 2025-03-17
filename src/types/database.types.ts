/**
 * データベースモデルの型定義
 * アプリ全体で一貫して使用する基本的なデータモデル
 */

/**
 * ユーザーモデル
 */
export type User = {
  id: number;
  nickname: string;
  grade: string;
  department: string;
  end_time: string | null;
  place: string | null;
  is_matched: boolean;
  recruiting_since: string;
  created_at: string;
  updated_at: string;
};

/**
 * いいねモデル
 */
export type Like = {
  from_user_id: number;
  to_user_id: number;
  created_at: string;
};

/**
 * マッチモデル
 */
export type Match = {
  id: number;
  user_id_1: number;
  user_id_2: number;
  created_at: string;
  is_canceled: boolean;
};

/**
 * メッセージモデル
 */
export type Message = {
  id: number;
  match_id: number;
  from_user_id: number;
  content: string;
  created_at: string;
};

/**
 * 募集中ユーザー（一覧表示用）の型定義
 * 通常のユーザー情報に「自分がいいねしたか」の情報を追加
 */
export type RecruitingUser = User & {
  liked_by_me: boolean;
};

/**
 * マッチユーザー（一覧/詳細表示用）の型定義
 */
export type MatchedUser = {
  match_id: number;
  user: User;
  latest_message?: Message;
};
