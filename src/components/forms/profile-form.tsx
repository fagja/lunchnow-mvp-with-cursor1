'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types/database.types';
import { ProfileFormProps } from '@/types/component.types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { generateEndTimeOptions } from '@/lib/date-utils';

// 学年選択肢
const gradeOptions = [
  { value: '1年', label: '1年' },
  { value: '2年', label: '2年' },
  { value: '3年', label: '3年' },
  { value: '4年', label: '4年' },
  { value: '5年', label: '5年' },
  { value: '6年', label: '6年' },
  { value: 'その他', label: 'その他' },
];

// 学部選択肢
const departmentOptions = [
  { value: '文学部', label: '文学部' },
  { value: '経済学部', label: '経済学部' },
  { value: '法学部（法律学科）', label: '法学部（法律学科）' },
  { value: '法学部（政治学科）', label: '法学部（政治学科）' },
  { value: '商学部', label: '商学部' },
  { value: '医学部', label: '医学部' },
  { value: '理工学部', label: '理工学部' },
  { value: '総合政策学部', label: '総合政策学部' },
  { value: '環境情報学部', label: '環境情報学部' },
  { value: '看護医療学部', label: '看護医療学部' },
  { value: '薬学部', label: '薬学部' },
  { value: 'その他', label: 'その他' },
];

// 場所選択肢
const placeOptions = [
  { value: '学食', label: '学食' },
  { value: '購買', label: '購買' },
  { value: 'キッチンカー', label: 'キッチンカー' },
  { value: 'コンビニ', label: 'コンビニ' },
  { value: 'ひよ裏（駅周辺）', label: 'ひよ裏（駅周辺）' },
  { value: '持参（お弁当など）', label: '持参（お弁当など）' },
  { value: 'その他', label: 'その他' },
];

export function ProfileForm({ initialData = {}, onSubmit, isLoading = false }: ProfileFormProps) {
  const [formData, setFormData] = useState<Partial<User>>({
    nickname: '',
    grade: '',
    department: '',
    end_time: null,
    place: null,
    ...initialData
  });

  // end_timeの選択肢を生成
  const [endTimeOptions, setEndTimeOptions] = useState<Array<{ value: string, label: string }>>([]);

  useEffect(() => {
    // 現在時刻から選択肢を生成
    const options = generateEndTimeOptions();
    setEndTimeOptions(options);

    // 初期値のデフォルト設定を削除し、ユーザーに選択を促す
  }, []);

  // 入力値の変更を処理
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // フォーム送信を処理
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* プロフィール入力エリア */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="font-semibold text-lg mb-4">プロフィール</h2>

        {/* ニックネーム */}
        <div className="mb-4">
          <label htmlFor="nickname" className="block text-sm font-medium mb-1">
            ニックネーム <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="nickname"
            name="nickname"
            value={formData.nickname || ''}
            onChange={handleChange}
            required
            maxLength={12}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="12文字以内"
          />
        </div>

        {/* 学年 */}
        <div className="mb-4">
          <label htmlFor="grade" className="block text-sm font-medium mb-1">
            学年 <span className="text-red-500">*</span>
          </label>
          <select
            id="grade"
            name="grade"
            value={formData.grade || ''}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="" disabled>選択してください</option>
            {gradeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 学部 */}
        <div className="mb-4">
          <label htmlFor="department" className="block text-sm font-medium mb-1">
            学部 <span className="text-red-500">*</span>
          </label>
          <select
            id="department"
            name="department"
            value={formData.department || ''}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="" disabled>選択してください</option>
            {departmentOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ステータス入力エリア */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="font-semibold text-lg mb-4">ステータス</h2>

        {/* 空き時間 */}
        <div className="mb-4">
          <label htmlFor="end_time" className="block text-sm font-medium mb-1">
            空き時間（いつまで空いているか）
          </label>
          <select
            id="end_time"
            name="end_time"
            value={formData.end_time || ''}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">選択してください</option>
            {endTimeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 場所 */}
        <div className="mb-4">
          <label htmlFor="place" className="block text-sm font-medium mb-1">
            食べたい場所
          </label>
          <select
            id="place"
            name="place"
            value={formData.place || ''}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">選択してください</option>
            {placeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 送信ボタン */}
      <div className="flex justify-center">
        <Button
          type="submit"
          disabled={isLoading}
          isLoading={isLoading}
          loadingText="保存中..."
          className="w-full max-w-xs"
        >
          OK
        </Button>
      </div>
    </form>
  );
}
