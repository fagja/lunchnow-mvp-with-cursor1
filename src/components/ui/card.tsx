import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * カードコンポーネント
 * ユーザー情報やコンテンツを表示するための枠組みを提供します。
 *
 * @param className - 追加のスタイルクラス
 * @param children - カード内に表示する要素
 */
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

/**
 * カードヘッダーコンポーネント
 * カードの上部に配置され、タイトルや説明などを含むことが多いです。
 *
 * @param className - 追加のスタイルクラス
 * @param children - ヘッダー内に表示する要素
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

/**
 * カードタイトルコンポーネント
 * カードの見出しを表示します。
 *
 * @param className - 追加のスタイルクラス
 * @param children - タイトルとして表示するテキスト
 */
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

/**
 * カード説明コンポーネント
 * カードの補足説明を表示します。
 *
 * @param className - 追加のスタイルクラス
 * @param children - 説明として表示するテキスト
 */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

/**
 * カードコンテンツコンポーネント
 * カードの主要な内容を表示するエリアです。
 *
 * @param className - 追加のスタイルクラス
 * @param children - コンテンツとして表示する要素
 */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

/**
 * カードフッターコンポーネント
 * カードの下部に配置され、アクションボタンなどを含むことが多いです。
 *
 * @param className - 追加のスタイルクラス
 * @param children - フッター内に表示する要素
 */
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
