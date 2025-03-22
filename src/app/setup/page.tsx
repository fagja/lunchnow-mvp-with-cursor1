"use client";

import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { TextField } from "@/components/ui/text-field";
import { SelectField } from "@/components/ui/select-field";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { SimpleMessage } from "@/components/ui/simple-message";
import { generateEndTimeOptions } from "@/lib/utils";
import { useSetupForm } from "@/hooks/useSetupForm";

export default function SetupPage() {
  const router = useRouter();
  const {
    loading,
    submitting,
    error,
    formData,
    handleChange,
    handleSubmit
  } = useSetupForm();

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

  // フォーム送信ハンドララッパー
  const onSubmit = async (e: React.FormEvent) => {
    const success = await handleSubmit(e);
    if (success) {
      router.push("/users");
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
          <form onSubmit={onSubmit} className="space-y-6 relative">
            {/* プロフィール入力エリア（必須） */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
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
            <div className="space-y-4 p-4 bg-white rounded-lg border border-gray-100">
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
