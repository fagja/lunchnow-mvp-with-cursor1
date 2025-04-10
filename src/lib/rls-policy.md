# Supabase RLS (Row Level Security) ポリシー

## MVP段階のセキュリティ方針

MVPでは最小限のセキュリティ設定とし、LocalStorageに保存されたユーザーIDによる簡易的な認証を採用します。

### 各テーブルのセキュリティ設定

#### usersテーブル
- 読み取り: すべてのユーザーが全レコードを閲覧可能
- 作成: 匿名ユーザーも新規レコード作成可能
- 更新: 自分のレコードのみ更新可能（user_id一致）
- 削除: 削除は無効（論理削除のみ）

#### likesテーブル
- 読み取り: 自分が関わるレコードのみ閲覧可能
- 作成: 自分がfrom_user_idのレコードのみ作成可能
- 更新: 更新は無効
- 削除: 自分がfrom_user_idのレコードのみ削除可能

#### matchesテーブル
- 読み取り: 自分が関わるレコードのみ閲覧可能（user_id_1またはuser_id_2）
- 作成: 作成は制限（相互いいね時に自動作成）
- 更新: 自分が関わるレコードのみis_canceledフラグの更新が可能
- 削除: 削除は無効

#### messagesテーブル
- 読み取り: 自分が関わるマッチのメッセージのみ閲覧可能
- 作成: 自分がfrom_user_idとして作成可能
- 更新: 更新は無効
- 削除: 削除は無効

## 将来の拡張
将来的には以下の強化を検討：
- 慶應メールによる認証
- ユーザーロールの導入
- データアクセスの詳細なコントロール
- 管理者機能の追加