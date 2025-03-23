"use client";

import { useState, useEffect } from "react";
import { generateEndTimeOptions, getClientUserId, saveUserId } from "@/lib/utils";
import { CreateUserRequest, UpdateUserRequest, ApiError } from "@/types/api.types";
import { registerUser, fetchUser, updateUser } from "@/api/users";

// 設定フォームの型定義
type SetupFormData = {
  nickname: string;
  grade: string;
  department: string;
  end_time: string | null;
  place: string | null;
};

// フックの戻り値の型定義
type UseSetupFormReturn = {
  loading: boolean;
  submitting: boolean;
  error: string | null;
  formData: SetupFormData;
  handleChange: (name: keyof SetupFormData, value: string | null) => void;
  handleSubmit: (e: React.FormEvent) => Promise<boolean>;
};

/**
 * カスタムフック - ランチ設定フォームのロジックを管理
 */
export function useSetupForm(): UseSetupFormReturn {
  // 状態管理
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  // フォームデータ
  const [formData, setFormData] = useState<SetupFormData>({
    nickname: "",
    grade: "",
    department: "",
    end_time: null,
    place: null,
  });

  /**
   * APIエラーを処理する共通関数
   */
  const handleApiError = (error: ApiError | string | unknown): string => {
    if (typeof error === 'string') {
      return error;
    } else if (typeof error === 'object' && error && 'message' in error) {
      return (error as { message: string }).message;
    }
    return "エラーが発生しました。もう一度お試しください。";
  };

  /**
   * 初期データの読み込み
   */
  const loadInitialData = async () => {
    try {
      // ローカルストレージからユーザーIDを取得
      const id = getClientUserId();
      setUserId(id);

      if (id) {
        // 既存ユーザーの場合、データを取得
        const response = await fetchUser(id);

        if (response.data) {
          // 取得したデータでフォームを初期化
          setFormData({
            nickname: response.data.nickname,
            grade: response.data.grade,
            department: response.data.department,
            end_time: response.data.end_time,
            place: response.data.place,
          });
        } else if (response.error) {
          // ユーザーが見つからない場合は新規ユーザーとして扱う（エラーは表示しない）
          console.log("ユーザーが見つかりません。新規ユーザーとして扱います。");
        }
      }
    } catch (err) {
      console.error("ユーザーデータ取得エラー:", err);
      // 初期データ取得エラーの場合も新規ユーザーとして扱う（エラーは表示しない）
    } finally {
      setLoading(false);
    }
  };

  /**
   * フォーム入力変更ハンドラ
   */
  const handleChange = (name: keyof SetupFormData, value: string | null) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * フォーム送信ハンドラ
   * @returns 成功した場合はtrue、失敗した場合はfalse
   */
  const handleSubmit = async (e: React.FormEvent): Promise<boolean> => {
    e.preventDefault();

    setSubmitting(true);
    setError(null);

    try {
      let response;

      if (userId) {
        // 既存ユーザーの更新
        response = await updateUser(formData as UpdateUserRequest);
      } else {
        // 新規ユーザー登録
        response = await registerUser(formData as CreateUserRequest);

        // 新規登録の場合、IDをLocalStorageに保存
        if (response.data && response.data.id) {
          saveUserId(response.data.id);
          setUserId(response.data.id);
        }
      }

      if (response.error) {
        setError(handleApiError(response.error));
        return false;
      } else if (response.data) {
        // 成功
        return true;
      } else {
        setError("予期しないレスポンス形式です。管理者に問い合わせてください。");
        return false;
      }
    } catch (err) {
      console.error("送信エラー:", err);
      setError("ネットワークエラーが発生しました。インターネット接続を確認して再試行してください。");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  // コンポーネントマウント時に初期データを読み込む
  useEffect(() => {
    loadInitialData();
  }, []);

  return {
    loading,
    submitting,
    error,
    formData,
    handleChange,
    handleSubmit,
  };
}
