import { Like, Match, Message, RecruitingUser, User, MatchedUser } from './database.types';

/**
 * APIエラーコード型
 * アプリケーション全体で発生しうるエラーの種類を定義
 */
export type ApiErrorCode =
  | 'validation_error'   // バリデーションエラー
  | 'not_found'          // リソースが見つからない
  | 'unauthorized_error' // 認証エラー
  | 'forbidden_error'    // 権限不足
  | 'conflict_error'     // 競合エラー
  | 'network_error'      // ネットワークエラー
  | 'timeout_error'      // タイムアウトエラー
  | 'general_error';     // その他の一般エラー

/**
 * APIエラー情報型
 */
export type ApiError = {
  code: ApiErrorCode;
  message: string;
};

/**
 * API共通レスポンス型
 */
export type ApiResponse<T> = {
  data?: T;
  error?: ApiError | string;
  status: number;
};

/**
 * ユーザー作成リクエスト
 */
export type CreateUserRequest = {
  nickname: string;
  grade: string;
  department: string;
  end_time?: string | null;
  place?: string | null;
};

/**
 * ユーザープロフィール・ステータス更新リクエスト
 */
export type UpdateUserRequest = {
  nickname?: string;
  grade?: string;
  department?: string;
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
 * マッチング生成リクエスト
 */
export type CreateMatchRequest = {
  from_user_id: number;
  to_user_id: number;
};

/**
 * マッチングキャンセルリクエスト
 */
export type CancelMatchRequest = {
  userId: number;
};

/**
 * メッセージ送信リクエスト
 */
export type SendMessageRequest = {
  from_user_id: number;
  content: string;
};

/**
 * ユーザー作成・更新レスポンス
 */
export type UserResponse = ApiResponse<User>;

/**
 * ユーザー一覧取得レスポンス
 */
export type UsersResponse = ApiResponse<User[]>;

/**
 * 募集中ユーザー一覧取得レスポンス
 */
export type RecruitingUsersResponse = ApiResponse<RecruitingUser[]>;

/**
 * いいねレスポンス
 */
export type LikeResponse = ApiResponse<Like>;

/**
 * マッチ取得レスポンス
 */
export type MatchResponse = ApiResponse<Match>;

/**
 * マッチ一覧取得レスポンス
 */
export type MatchesResponse = ApiResponse<Match[]>;

/**
 * メッセージ送信レスポンス
 */
export type MessageResponse = ApiResponse<Message>;

/**
 * メッセージ履歴取得レスポンス
 */
export type MessagesResponse = ApiResponse<Message[]>;

/**
 * マッチしたユーザー情報レスポンス
 */
export type MatchedUserResponse = ApiResponse<MatchedUser>;
