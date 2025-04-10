'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User } from '@/types/database.types';
import { ProfileFormProps } from '@/types/component.types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { generateEndTimeOptions } from '@/lib/date-utils';
import { GRADE_OPTIONS, DEPARTMENT_OPTIONS, PLACE_OPTIONS } from '@/constants/form-options';

export function ProfileForm({ initialData = {}, onSubmit, isLoading = false, isEditMode = false }: ProfileFormProps) {
  const [formData, setFormData] = useState<Partial<User>>({
    nickname: '',
    grade: '',
    department: '',
    end_time: null,
    place: null,
    ...initialData
  });

  // initialDataが変更されたら再設定する
  useEffect(() => {
    // 値が変更された場合のみ更新
    if (JSON.stringify(initialData) !== JSON.stringify(formData)) {
      console.log('ProfileForm: initialDataが変更されました', initialData);

      setFormData(prev => ({
        ...prev,
        ...initialData
      }));

      console.log('ProfileForm: isEditMode', isEditMode);
    }
  }, [initialData, isEditMode]);

  // end_timeの選択肢を生成
  const [endTimeOptions, setEndTimeOptions] = useState<Array<{ value: string, label: string }>>([]);

  useEffect(() => {
    // 現在時刻から選択肢を生成
    const options = generateEndTimeOptions();
    setEndTimeOptions(options);
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* プロフィール入力エリア */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <h2 className="font-semibold text-lg mb-3">👤 あなたの情報</h2>

        {/* ニックネーム */}
        <div className="mb-3 pb-3 border-b border-gray-100">
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
        <div className="mb-3 pb-3 border-b border-gray-100">
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
            {GRADE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 学部 */}
        <div>
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
            {DEPARTMENT_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* セクション間の区切り（非表示の空白） */}
      <div style={{ margin: '12px 0', borderBottom: '1px solid #eaeaea' }}></div>

      {/* ステータス入力エリア */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <h2 className="font-semibold text-lg mb-3">🍴 ランチの予定</h2>

        {/* 空き時間 */}
        <div className="mb-3 pb-3 border-b border-gray-100">
          <label htmlFor="end_time" className="block text-sm font-medium mb-1">
            いつまで空いているか
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
        <div>
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
            {PLACE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 利用規約とプライバシーポリシーへのリンク部分 - 上部に細い区切り線を追加 */}
      <div style={{ paddingTop: '10px', marginTop: '10px', borderTop: '1px solid #eaeaea' }}>
        <div style={{ fontSize: '11px', color: '#666', paddingLeft: '10px' }}>
          <p style={{ marginBottom: '2px' }}>
            「同意して始める」を押すことで、
          </p>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Link href="/terms" style={{ color: '#4a86e8', textDecoration: 'underline' }} target="_blank">
              利用規約
            </Link>
            <span style={{ margin: '0 4px' }}>・</span>
            <Link href="/privacy" style={{ color: '#4a86e8', textDecoration: 'underline' }} target="_blank">
              プライバシーポリシー
            </Link>
          </div>
          <p style={{ marginTop: '2px' }}>に同意したものとみなします。</p>
        </div>
      </div>

      {/* 送信ボタン */}
      <div className="flex justify-center mt-3">
        <Button
          type="submit"
          disabled={isLoading}
          isLoading={isLoading}
          loadingText="保存中..."
          className="w-full max-w-xs"
        >
          同意して始める
        </Button>
      </div>
    </form>
  );
}
