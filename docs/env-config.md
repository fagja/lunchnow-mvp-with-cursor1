# 環境変数設定ガイド

このドキュメントでは、LunchNow MVPの環境変数設定について説明します。

## 開発環境（.env.local）

開発環境では、`.env.local`ファイルに以下の環境変数を設定します。

```
# Supabase URLs
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# アプリケーション設定
NEXT_PUBLIC_APP_NAME=LunchNow
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 本番環境（Vercel）

本番環境では、Vercelのダッシュボードから以下の環境変数を設定します。

### 必須環境変数

| 環境変数 | 説明 | 取得方法 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase APIのURL | Supabaseダッシュボード > Settings > API > API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase匿名キー | Supabaseダッシュボード > Settings > API > anon/public |
| `NEXT_PUBLIC_APP_NAME` | アプリケーション名 | `LunchNow`に設定 |
| `NEXT_PUBLIC_APP_URL` | アプリケーションのURL | デプロイ後のVercelドメイン（例: `https://lunchnow.vercel.app`） |

### オプション環境変数

| 環境変数 | 説明 | 取得方法 |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | より高い権限を持つサービスロールキー | Supabaseダッシュボード > Settings > API > service_role |

## 環境変数の設定手順

### Vercelへの環境変数設定

1. Vercelでプロジェクトを作成/選択
2. 「Settings」>「Environment Variables」を選択
3. 上記の変数を追加
4. 「Save」ボタンをクリック

### 注意事項

- `service_role` キーは高い権限を持つため、`NEXT_PUBLIC_` プレフィックスをつけないでください
- 本番環境の値はリポジトリにコミットしないでください
- 環境変数が正しく設定されているか、デプロイ後に確認してください
