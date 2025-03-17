import { Like, Match, Message, RecruitingUser, User } from './database.types';

/**
 * API共通レスポンス型
 */
export type ApiResponse<T> = {
  data?: T;
  error?: string;
  status: number;
};

/**
 * ユーザープロフィール・ステータス更新リクエスト
 */
export type UpdateUserRequest = {
  nickname: string;
  grade: string;
  department: string;
  end_time?: string | null;
  place?: string | null;
};

/**
 * いいね（Like）リクエスト
 */
export type CreateLikeRequest = {
  fromUserId: number;
  toUserId: number;
};

/**
 * メッセージ送信リクエスト
 */
export type SendMessageRequest = {
  match_id: number;
  from_user_id: number;
  content: string;
};

/**
 * ユーザー作成・更新レスポンス
 */
export type UserResponse = ApiResponse<User>;

/**
 * 募集中ユーザー一覧取得レスポンス
 */
export type RecruitingUsersResponse = ApiResponse<RecruitingUser[]>;

/**
 * いいねレスポンス
 */
export type LikeResponse = ApiResponse<Like | Like[]>;

/**
 * マッチ取得レスポンス
 */
export type MatchResponse = ApiResponse<Match>;

/**
 * メッセージ送信レスポンス
 */
export type MessageResponse = ApiResponse<Message>;

/**
 * メッセージ履歴取得レスポンス
 */
export type MessagesResponse = ApiResponse<Message[]>;
