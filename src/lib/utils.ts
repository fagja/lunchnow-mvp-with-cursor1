import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * レスポンシブパディング設定
 * 画面サイズに応じたパディングを定義
 */
export const responsivePadding = {
  base: 'px-4 py-4', // モバイル用パディング
  md: 'md:px-6 md:py-6', // タブレット用パディング
  lg: 'lg:px-8 lg:py-8' // デスクトップ用パディング
}

/**
 * コンテナサイズ設定
 * 画面サイズに応じた最大幅を定義
 */
export const containerSizes = {
  sm: 'max-w-screen-sm', // モバイル用最大幅
  md: 'max-w-screen-md', // タブレット用最大幅
  lg: 'max-w-screen-lg' // デスクトップ用最大幅
}
