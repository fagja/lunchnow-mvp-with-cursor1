"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { TextField } from "@/components/ui/text-field";
import { SelectField } from "@/components/ui/select-field";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { SimpleMessage } from "@/components/ui/simple-message";
import { generateEndTimeOptions, getUserId, saveUserId } from "@/lib/utils";
import { CreateUserRequest, UpdateUserRequest } from "@/types/api.types";
import { registerUser, fetchUser, updateUser } from "@/api/users";

export default function SetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  // フォームの状態
  const [formData, setFormData] = useState<CreateUserRequest | UpdateUserRequest>({
    nickname: "",
    grade: "",
    department: "",
    end_time: null,
    place: null,
  });

  // 選択肢のデータ
  const gradeOptions = ["1年", "2年", "3年", "4年", "5年", "6年", "その他"];
  const departmentOptions = [
    "文学部", "経済学部", "法律学科", "政治学科", "商学部",
    "医学部", "理工学部", "総合政策学部", "環境情報学部",
    "看護医療学部", "薬学部", "その他"
  ];
  const placeOptions = [
    "学食", "購買", "キッチンカー", "コンビニ",
    "ひよ裏（駅周辺）", "持参（お弁当など）", "その他"
  ];
  const endTimeOptions = generateEndTimeOptions();

  // 初期データ読み込み
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const id = getUserId();
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
            let errorMessage: string;

            if (typeof response.error === 'string') {
              errorMessage = response.error;
            } else if (typeof response.error === 'object' && response.error.message) {
              errorMessage = response.error.message;
            } else {
              errorMessage = "ユーザー情報の取得に失敗しました。もう一度お試しください。";
            }

            setError(errorMessage);
          }
        }
      } catch (err) {
        console.error("ユーザーデータ取得エラー:", err);
        setError("ネットワークエラーが発生しました。インターネット接続を確認して再試行してください。");
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  // 入力変更ハンドラ
  const handleChange = (name: string, value: string | null) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // フォーム送信ハンドラ
  const handleSubmit = async (e: React.FormEvent) => {
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
        let errorMessage: string;

        if (typeof response.error === 'string') {
          errorMessage = response.error;
        } else if (typeof response.error === 'object' && response.error.message) {
          errorMessage = response.error.message;
        } else {
          errorMessage = "エラーが発生しました。もう一度お試しください。";
        }

        setError(errorMessage);
      } else if (response.data) {
        // 成功時はユーザー一覧画面へ遷移
        router.push("/users");
      } else {
        setError("予期しないレスポンス形式です。管理者に問い合わせてください。");
      }
    } catch (err) {
      console.error("送信エラー:", err);
      setError("ネットワークエラーが発生しました。インターネット接続を確認して再試行してください。");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <div className="w-full max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">ランチ設定</h1>

        {loading ? (
          <div className="flex justify-center my-8">
            <Spinner />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 relative">
            {/* プロフィール入力エリア（必須） */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">プロフィール情報（必須）</h2>

              <TextField
                label="ニックネーム"
                name="nickname"
                value={formData.nickname}
                onChange={(e) => handleChange("nickname", e.target.value)}
                required
                maxLength={12}
                helperText="1～12文字で入力してください"
              />

              <div className="relative z-30">
                <SelectField
                  label="学年"
                  name="grade"
                  value={formData.grade}
                  onChange={(value) => handleChange("grade", value)}
                  options={gradeOptions.map(option => ({ value: option, label: option }))}
                  required
                />
              </div>

              <div className="relative z-20">
                <SelectField
                  label="学部"
                  name="department"
                  value={formData.department}
                  onChange={(value) => handleChange("department", value)}
                  options={departmentOptions.map(option => ({ value: option, label: option }))}
                  required
                />
              </div>
            </div>

            {/* ステータス入力エリア（任意） */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">募集ステータス（任意）</h2>

              <div className="relative z-10">
                <SelectField
                  label="空き時間"
                  name="end_time"
                  value={formData.end_time || ""}
                  onChange={(value) => handleChange("end_time", value)}
                  options={endTimeOptions.map(option => ({ value: option, label: option }))}
                  placeholder="選択してください"
                />
              </div>

              <div className="relative z-0">
                <SelectField
                  label="食べたい場所"
                  name="place"
                  value={formData.place || ""}
                  onChange={(value) => handleChange("place", value)}
                  options={placeOptions.map(option => ({ value: option, label: option }))}
                  placeholder="選択してください"
                />
              </div>
            </div>

            {/* エラーメッセージ */}
            {error && (
              <SimpleMessage type="error">
                {error}
              </SimpleMessage>
            )}

            {/* 送信ボタン */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={submitting}
                className="w-full"
              >
                {submitting ? <Spinner size="sm" /> : "OK"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </PageContainer>
  );
}
