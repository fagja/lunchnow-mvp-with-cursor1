/**
 * バリデーション関数ライブラリ
 * MVPではシンプルなバリデーションのみ実装
 */

/**
 * 必須入力チェック
 * @param value 検証する値
 * @returns エラーメッセージまたはnull
 */
export function validateRequired(value: string | undefined | null): string | null {
  if (!value || value.trim() === '') {
    return '入力は必須です';
  }
  return null;
}

/**
 * 最小/最大文字数チェック
 * @param value 検証する値
 * @param min 最小文字数
 * @param max 最大文字数
 * @returns エラーメッセージまたはnull
 */
export function validateLength(value: string, min: number, max: number): string | null {
  if (!value) return null; // 空の場合はrequiredバリデーションに任せる
  
  if (value.length < min) {
    return `${min}文字以上で入力してください`;
  }
  if (value.length > max) {
    return `${max}文字以内で入力してください`;
  }
  return null;
}

/**
 * ニックネームバリデーション
 * @param nickname ニックネーム
 * @returns エラーメッセージまたはnull
 */
export function validateNickname(nickname: string): string | null {
  // 必須チェック
  const requiredError = validateRequired(nickname);
  if (requiredError) return requiredError;
  
  // 文字数チェック（1〜12文字）
  return validateLength(nickname, 1, 12);
}

/**
 * メッセージ内容バリデーション
 * @param content メッセージ内容
 * @returns エラーメッセージまたはnull
 */
export function validateMessageContent(content: string): string | null {
  // 必須チェック
  const requiredError = validateRequired(content);
  if (requiredError) return requiredError;
  
  // 文字数チェック（1〜200文字）
  return validateLength(content, 1, 200);
}

/**
 * フォームフィールドの値が変更されたかチェック
 * @param originalValue 元の値
 * @param newValue 新しい値
 * @returns 変更があればtrue、なければfalse
 */
export function isValueChanged(originalValue: any, newValue: any): boolean {
  return JSON.stringify(originalValue) !== JSON.stringify(newValue);
}