/**
 * バリデーション関数ライブラリ
 * MVPではシンプルなバリデーションのみ実装
 */

/**
 * 必須入力チェック
 * @param value 検証する値
 * @param fieldName フィールド名（エラーメッセージ用）
 * @returns エラーメッセージまたはnull
 */
export function validateRequired(
  value: string | undefined | null,
  fieldName: string = '入力'
): string | null {
  if (!value || value.trim() === '') {
    return `${fieldName}は必須です`;
  }
  return null;
}

/**
 * 最小/最大文字数チェック
 * @param value 検証する値
 * @param min 最小文字数
 * @param max 最大文字数
 * @param fieldName フィールド名（エラーメッセージ用）
 * @returns エラーメッセージまたはnull
 */
export function validateLength(
  value: string,
  min: number,
  max: number,
  fieldName: string = '入力'
): string | null {
  if (!value) return null; // 空の場合はrequiredバリデーションに任せる

  if (value.length < min) {
    return `${fieldName}は${min}文字以上で入力してください`;
  }
  if (value.length > max) {
    return `${fieldName}は${max}文字以内で入力してください`;
  }
  return null;
}

/**
 * 複合バリデーション（必須 + 文字数）
 * @param value 検証する値
 * @param min 最小文字数
 * @param max 最大文字数
 * @param fieldName フィールド名（エラーメッセージ用）
 * @returns エラーメッセージまたはnull
 */
export function validateRequiredWithLength(
  value: string | undefined | null,
  min: number,
  max: number,
  fieldName: string = '入力'
): string | null {
  // 必須チェック
  const requiredError = validateRequired(value, fieldName);
  if (requiredError) return requiredError;

  // 文字数チェック
  return validateLength(value as string, min, max, fieldName);
}

/**
 * ニックネームバリデーション
 * @param nickname ニックネーム
 * @returns エラーメッセージまたはnull
 */
export function validateNickname(nickname: string): string | null {
  return validateRequiredWithLength(nickname, 1, 12, 'ニックネーム');
}

/**
 * メッセージ内容バリデーション
 * @param content メッセージ内容
 * @returns エラーメッセージまたはnull
 */
export function validateMessageContent(content: string): string | null {
  return validateRequiredWithLength(content, 1, 200, 'メッセージ');
}

/**
 * フォームフィールドの値が変更されたかチェック
 * @param originalValue 元の値
 * @param newValue 新しい値
 * @returns 変更があればtrue、なければfalse
 */
export function isValueChanged<T>(originalValue: T, newValue: T): boolean {
  return JSON.stringify(originalValue) !== JSON.stringify(newValue);
}
