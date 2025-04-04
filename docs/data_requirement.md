# data_requirement.md

本ドキュメントでは、**データ設計**（テーブル仕様・運用ルールなど）を示します。
**MVP段階**としてシンプルな構成を採用し、今後の拡張を想定した柔軟性も持たせています。

**本ドキュメントの主な内容**:
- データベース設計と構造
- データ処理ロジック
- API仕様と実装方針
- パフォーマンス最適化

**関連ドキュメント**:
- [プロジェクト全体要件](./projectbrief.md): アプリ概要、機能一覧、非機能要件
- [UI要件定義書](./ui_requirement.md): 画面構成、UI要素、ユーザーフロー

---

## 1. 前提と基本方針

1. **「募集中」ユーザー(`is_matched = false` かつ最近20分以内に recruiting_since が更新されたユーザー)のみ `/users` に表示**
2. **1ユーザーにつき同時に1マッチのみ**
   - 相互Likeでマッチ → `is_matched = true` に更新
   - キャンセルで再び `is_matched = false` に戻す + recruiting_since を現在時刻に更新 + 当事者間の相互Likeをlikesテーブルから削除 (時間内なら表示復帰)
3. **当日以外のステータス、ライクやマッチ情報は反映させない**
   - DB上は蓄積していくが、MVPでは物理削除しない
   - 将来的に日次バッチなどで削除/アーカイブ可能
4. **MVPは実装コストを抑えつつ、基本機能を優先**
   - バリデーションはシンプルに
   - リアルタイム通信は必要最小限に
5. **シンプルなテーブル設計**
   - MVPではユーザープロフィールとステータス情報を単一テーブルで管理
   - UI/APIの実装と整合性を保ち、開発効率を優先

---

## 2. テーブル仕様

### 2.1 `users` (ユーザープロフィールとステータス)

| カラム名        | 型              | NOT NULL | 主キー | 説明                                                                 |
|----------------|-----------------|----------|--------|----------------------------------------------------------------------|
| id             | `bigserial`    | YES      | PK     | ユーザーID (自動採番、LocalStorageに保存)                             |
| nickname       | `varchar(12)`  | YES      |        | ニックネーム (1〜12文字)                                              |
| grade          | `varchar(10)`  | YES      |        | 学年 (例: '1年','2年','3年','その他' 等)                            |
| department     | `varchar(50)`  | YES      |        | 学部 (例: '経済学部','商学部','その他' 等)                           |
| end_time       | `varchar(10)`  | NO       |        | いつまで空いているか（例: "~14:00"、"~12:30"などの文字列形式）        |
| place          | `varchar(30)`  | NO       |        | 食べたい場所 (例: '学食','購買','キッチンカー','コンビニ','その他' 等) |
| is_matched     | `boolean`      | YES      |        | マッチ状態 (false=未マッチ/ true=マッチ中)。相互Likeでマッチ成立時→true, キャンセル時→false に戻す |
| recruiting_since | `timestamp`  | YES      |        | 募集状態にした時刻（ゴーストユーザー判定用）                       |
| created_at     | `timestamp`    | YES      |        | レコード作成日時                                                    |
| updated_at     | `timestamp`    | YES      |        | レコード更新日時                                                    |

**end_timeの取り扱い**:
1. "~HH:MM" 形式の文字列として `varchar(10)` 型で直接保存
2. フロントエンドではそのまま表示（変換処理不要）
3. UI上でのプルダウン選択肢も同様の形式で提供

---

### 2.2 `likes` (Like履歴)

| カラム名      | 型          | NOT NULL | 主キー(複合)       | 説明                                            |
|--------------|------------|----------|--------------------|-------------------------------------------------|
| from_user_id | `bigint`   | YES      | PK(1)              | 「Like」した側ユーザーID                        |
| to_user_id   | `bigint`   | YES      | PK(2)              | 「Like」された側ユーザーID                      |
| created_at   | `timestamp`| YES      |                    | Like押下日時                                    |

- **マッチ成立判定**:
  - A→B, B→A 両方存在すれば相互Like → `matches` テーブルにINSERT
  - **当日のLikeのみ有効** : created_at::date = CURRENT_DATE など
  - その際、両者 `is_matched=true` に更新 → 一覧から除外
- **複合主キー** = `(from_user_id, to_user_id)`。同日中は同じ相手を二重Likeはできない。

---

### 2.3 `matches` (マッチ成立)

| カラム名     | 型          | NOT NULL | 主キー | 説明                                                                                    |
|-------------|------------|----------|--------|-----------------------------------------------------------------------------------------|
| id          | `bigserial`| YES      | PK     | マッチID (チャットルームIDにも相当)                                                     |
| user_id_1   | `bigint`   | YES      |        | マッチしたユーザー1ID                                                                   |
| user_id_2   | `bigint`   | YES      |        | マッチしたユーザー2ID                                                                   |
| created_at  | `timestamp`| YES      |        | マッチ成立日時 (相互Like判明時)                                                         |
| is_canceled | `boolean`  | YES      |        | キャンセル状態 (false=アクティブ、true=キャンセル済み)。デフォルトはfalse                  |

- **1ユーザー1マッチ**の制約はDBレベルで確保する。データベース機能を利用して、アクティブなマッチ（`is_canceled = false`）が1ユーザーにつき1つまでとなるように制約を設ける。

  実装例（PostgreSQLでの部分ユニークインデックスを使用した場合）:
  ```sql
  CREATE UNIQUE INDEX unique_active_match_user1
    ON matches(user_id_1)
    WHERE is_canceled = false;

  CREATE UNIQUE INDEX unique_active_match_user2
    ON matches(user_id_2)
    WHERE is_canceled = false;
  ```

- **キャンセル処理**:
  - /chat 画面でキャンセル → is_canceled にtrueをセット + 当事者2人の is_matched=false に更新 + recruiting_since を現在時刻に設定 + 当事者間の相互Likeをlikesテーブルから削除して、ユーザー一覧画面(`/users`)に遷移

---

### 2.4 `messages` (チャットメッセージ)

| カラム名       | 型         | NOT NULL | 主キー | 説明                                           |
|---------------|------------|----------|--------|-------------------------------------------------|
| id            | `bigserial`| YES      | PK     | メッセージID                                    |
| match_id      | `bigint`   | YES      | FK->matches.id | どのマッチ(チャットルーム)に紐づくメッセージか |
| from_user_id  | `bigint`   | YES      |        | 送信者ユーザーID                               |
| content       | `text`     | YES      |        | メッセージ本文 (最大200文字, UI側バリデーション) |
| created_at    | `timestamp`| YES      |        | メッセージ送信日時                              |

- **MVPでは削除しない**
- キャンセル後や翌日以降もDBに残る

### テーブル定義における注記
- 主キーとなるIDには`bigserial`（自動採番）を使用
- 外部キー参照には`bigint`を使用（PostgreSQLでは`bigserial`は内部的に`bigint`として扱われる）
- すべての時刻情報には`timestamp with time zone`を使用し、JSTで統一管理

---

## 3. 運用フロー・ルール

### 3.1 「募集中」状態管理
- **追加/更新時**:
  - /setup 画面でOK押下 → usersテーブルを更新
  - is_matched=false に設定（マッチしていない状態）
  - recruiting_since に現在時刻を設定（募集開始時刻）
  - end_time, placeは任意
- **表示**:
  - /users 画面で 以下の条件を満たすユーザーのみ表示
  - `is_matched = false`（マッチしていない）
  - `recruiting_since > NOW() - INTERVAL '20 minutes'`（20分以内に募集開始）
  - `id != current_user_id`（自分以外）
  - 詳細なクエリ例は[セクション7.2](#72-パフォーマンス最適化クエリ)を参照
- **ゴースト対策**:
  - サーバー側バッチ処理は実装せず、クエリでフィルタリングする方式を採用
  - 20分以上経過したユーザーは自動的に表示されなくなる（データベース上のフラグは変更しない）
  - ユーザーには「募集状態は20分間有効です」と説明し、必要に応じて再設定を促す
  - **UI上の対応**:
    - ユーザー一覧画面で明確な説明テキストを表示：「募集状態は20分間有効です」「20分経過した場合、再度ランチ設定画面に戻り、再設定してください」
    - セットアップ画面での再設定は簡単な操作で、ユーザー負担は少ない
  - **ユーザー体験への配慮**:
    - ユーザー利用時間が15分程度と短いため、20分のタイムアウトは適切なバランス
    - マッチキャンセル時には両ユーザーの`is_matched=false`に戻すとともに、`recruiting_since`も現在時刻に更新
    - これにより、キャンセル後すぐに「募集中」ユーザーとして表示される

### 3.2 マッチング (Likes → Matches)
1. ユーザーAがBにLike → likes に (A,B) 追加
2. BもAにLike → (B,A) 追加された時点で相互Like判定
3. マッチ成立 → matches に (user_id_1, user_id_2) INSERT + A,Bの is_matched=true
4. /chat へ遷移

### 3.3 1ユーザー1マッチ制約
- 1ユーザーは同時に1つのアクティブなマッチのみ持てるように**DBレベルのみ**で制約を設ける
- MVPの原則に則り、アプリケーションレベルでの追加チェックは実装せず、データベースの制約機能に依存する

### 3.4 チャット
- /chat 画面でメッセージ送信 → messages にINSERT
- 3秒間隔のポーリングによるメッセージ取得（画面遷移時やバックグラウンド時は自動停止）
- キャンセル時 → matches.is_canceled 更新し両ユーザー is_matched=false + recruiting_since を現在時刻に更新 + 相互のLikeをlikesテーブルから削除してユーザー一覧画面に遷移

### 3.5 当日以外は非表示 (MVP)
- DBには蓄積し続け、古いデータも消さない
- Likeやマッチについては、アプリ表示時に created_at::date = CURRENT_DATE などのクエリ制限で当日分のみ取得
- ユーザー一覧表示については、20分以内の制限で十分なため日付フィルターは適用しない

### 3.6 タイムゾーン処理
- すべての日時はJST固定とし、サーバー/クライアント間での変換は行わない
- 「当日」判定はJSTでの日付変更（0:00）を基準とする
- 詳細な実装方法については[セクション9 (タイムゾーン処理の詳細)](#9-タイムゾーン処理の詳細)を参照

---

## 4. ER図イメージ

erDiagram
users {
bigserial id PK
varchar(12) nickname
varchar(10) grade
varchar(50) department
varchar(10) end_time
varchar(30) place
boolean is_matched
timestamp recruiting_since
timestamp created_at
timestamp updated_at
}
likes {
bigint from_user_id PK
bigint to_user_id PK
timestamp created_at
}
matches {
bigserial id PK
bigint user_id_1
bigint user_id_2
timestamp created_at
boolean is_canceled
}
messages {
bigserial id PK
bigint match_id FK
bigint from_user_id
text content
timestamp created_at
}
matches ||--|{ messages : "1 to many"
likes }|--|| likes : "複合PK (from_user_id,to_user_id)"

---

## 5. MVPでの実装方針

### 5.1 優先実装項目
- 基本機能（登録・ステータス設定・一覧表示・マッチング・チャット）
- ゴーストユーザー対策（サーバー側チェック）
- 当日のデータのみ表示

MVPの基本方針の詳細については[プロジェクト全体要件の3項](./projectbrief.md#3-mvp設計方針)を参照してください。

### 5.2 簡略化する項目
- バリデーション：必要最小限（必須項目・文字数のみ）
- 複雑な通信処理：リアルタイム通信ではなくポーリングと手動更新で対応
- UI：シンプルな実装

### 5.3 バリデーション共通ルール

バリデーション方針については[UI要件定義書の5.1項](./ui_requirement.md#51-バリデーション)を参照してください。

### 5.4 将来的な拡張
- MVPリリース後に認証機能、画像アップロード、通知機能を追加予定
- 日次データクリーンアップは利用状況に応じて検討
- 将来的なユーザー数増加時に、パフォーマンス要件に応じてテーブル分割を検討

---

## 6. 主要API機能

### 6.1 API概要

MVPで実装する主要な機能を示します：

1. **ユーザー関連**
   - ユーザー作成・更新
   - ユーザー情報取得

2. **いいね・マッチング関連**
   - いいね送信
   - マッチキャンセル
   - アクティブなマッチ取得

3. **メッセージ関連**
   - メッセージ送信
   - マッチのメッセージ履歴取得

**MVPにおけるAPI実装の簡素化**:
- バリデーションはクライアント側で実施し、サーバー側は最小限に抑える
- エラーレスポンスは共通フォーマットで単純化
- リクエスト失敗時は汎用的なエラーメッセージを返す

### 6.2 API最適化戦略

MVPの開発効率とパフォーマンスを両立するため、以下のAPI最適化戦略を採用します：

1. **レスポンスデータ最適化**
   - 表示に不要なフィールドは省略
   - 日時データは表示用にフォーマット済みの形式で返却
   - 表示用に整形されたデータをサーバー側で準備

2. **バッチ処理の効率化**
   - マッチング処理の一括実行
   - 必要なデータの一括取得

### 6.3 API仕様例

以下に代表的なAPIの仕様例を示します。

#### 6.3.1 ユーザー情報API

**ユーザー作成API**
**優先度**: 必須
**エンドポイント**: `/api/users`
**メソッド**: `POST`

**リクエスト例**:
```json
{
  "nickname": "たろう",
  "grade": "2年",
  "department": "経済学部",
  "end_time": "~14:00", // 表示形式のまま文字列として保存
  "place": "学食"
}
```

**レスポンス例**:
```json
{
  "id": 123, // 自動生成されたID
  "nickname": "たろう",
  "display_info": "2年 経済学部", // 表示用に結合済み
  "end_time": "~14:00", // 文字列をそのまま返却
  "place": "学食",
  "is_matched": false // デフォルトでfalseに設定
}
```

**備考**:
- `is_matched`は自動的に`false`に設定されます
- `recruiting_since`は自動的に現在時刻に設定されます
- `created_at`と`updated_at`も自動的に現在時刻に設定されます

**ユーザー更新API**
**優先度**: 必須
**エンドポイント**: `/api/users/{id}`
**メソッド**: `PUT`

**リクエスト例**:
```json
{
  "nickname": "たろう",
  "grade": "2年",
  "department": "経済学部",
  "end_time": "~14:00", // 表示形式のまま文字列として保存
  "place": "学食"
}
```

**レスポンス例**:
```json
{
  "id": 123,
  "nickname": "たろう",
  "display_info": "2年 経済学部", // 表示用に結合済み
  "end_time": "~14:00", // 文字列をそのまま返却
  "place": "学食",
  "is_matched": false // マッチング状態
}
```

**備考**:
- `recruiting_since`は自動的に現在時刻に更新されます
- `updated_at`も自動的に現在時刻に更新されます
- 既存のマッチング状態（`is_matched`）は変更されません

#### 6.3.2 募集中ユーザー一覧API

**優先度**: 必須
**エンドポイント**: `/api/users/recruiting`
**メソッド**: `GET`

**クエリパラメータ**:
- `current_user_id`: 自分のユーザーID（自分を除外）

**レスポンス例**:
```json
{
  "users": [
    {
      "id": 456,
      "nickname": "はなこ",
      "display_info": "3年 商学部",
      "end_time": "~14:00",
      "place": "学食",
      "liked_by_me": true // いいね済みかの判定用
    }
  ],
  "last_updated": "12:34" // 最終更新時刻
}
```

#### 6.3.3 いいね送信 API

**優先度**: 必須
**エンドポイント**: `/api/likes`
**メソッド**: `POST`

**リクエスト例**:
```json
{
  "from_user_id": 123,
  "to_user_id": 456
}
```

**レスポンス例（マッチなし）**:
```json
{
  "status": "liked"
}
```

**レスポンス例（マッチ成立）**:
```json
{
  "status": "matched",
  "match_id": 789,
  "partner": {
    "id": 456,
    "nickname": "はなこ",
    "display_info": "3年 商学部"
  }
}
```

#### 6.3.4 メッセージ関連API

**優先度**: 必須
**エンドポイント**: `/api/matches/{match_id}/messages`
**メソッド**: `POST`（送信）/ `GET`（取得）

**送信リクエスト例**:
```json
{
  "from_user_id": 123,
  "content": "こんにちは！"
}
```

**送信レスポンス例**:
```json
{
  "id": 101,
  "content": "こんにちは！",
  "from_user_id": 123,
  "created_at": "12:35"
}
```

**取得レスポンス例**:
```json
{
  "messages": [
    {
      "id": 101,
      "content": "こんにちは！",
      "from_user_id": 123,
      "created_at": "12:35"
    },
    {
      "id": 102,
      "content": "よろしくお願いします！",
      "from_user_id": 456,
      "created_at": "12:36"
    }
  ],
  "match": {
    "id": 789,
    "user_id_1": 123,
    "user_id_2": 456
  }
}
```

**備考**:
- MVPでは単純に全メッセージを取得します
- created_atは表示用にフォーマット済みの時刻（"HH:MM"形式）として返却

#### 6.3.5 マッチキャンセルAPI

**優先度**: 必須
**エンドポイント**: `/api/matches/{match_id}/cancel`
**メソッド**: `POST`

**実装詳細**:
- matches テーブルの is_canceled を true に更新
- 両ユーザーの is_matched を false に更新し、recruiting_since を現在時刻に設定
- 相互のLikeエントリを likes テーブルから削除（当事者間の即時再マッチ防止のため）

**レスポンス例**:
```json
{
  "status": "canceled"
}
```

#### 6.3.6 エラーレスポンス

すべてのAPIで共通のエラーフォーマットを使用します：

```json
{
  "error": {
    "code": "エラーコード",
    "message": "エラーメッセージ"
  }
}
```

**主なエラーコード**:
- `validation_error`: 入力値検証エラー
- `not_found`: リソースが見つからない
- `general_error`: その他のエラー

### 6.4 マッチングフロー図

マッチングの処理フローを時系列で説明します：

```
【ユーザーAとBのマッチングシナリオ（時系列）】

1. A: ランチ設定画面で情報入力→保存
   システム: Aのis_matched=false, recruiting_since=現在時刻に設定

2. B: ランチ設定画面で情報入力→保存
   システム: Bのis_matched=false, recruiting_since=現在時刻に設定

3. A: ユーザー一覧画面でBを発見→「とりまランチ？」ボタンクリック
   システム: likes(A,B)を追加→相互Likeなし→Aの画面は変わらず

4. B: ユーザー一覧画面でAを発見→「とりまランチ？」ボタンクリック
   システム: likes(B,A)を追加→相互Like検出→マッチングレコード作成
            →A,Bのis_matched=trueに更新

5. システム: A,B両画面にマッチングモーダル表示
   A,B: モーダル確認→チャット画面へ自動遷移

6. A,B: チャットでメッセージ交換

7. B: キャンセルボタン押下→確認ダイアログ→OK
   システム: マッチ.is_canceled=true, A,Bのis_matched=false,
            recruiting_since=現在時刻に更新, 相互Like(A→B, B→A)を削除

8. システム: Aに、Bがキャンセルしたことをダイアログで通知
   A,B: ユーザー一覧画面に戻る（募集中状態で表示）
```

データフロー図：

```
1. ユーザーA           ユーザーB
   募集中状態          募集中状態
   (is_matched=false)  (is_matched=false)
      |                    |
2. A→BにLike             B→AにLike
   likes(A,B)追加         likes(B,A)追加
      |                    |
3. 相互Like検出（サーバー側で）
      |
4. match作成(is_canceled=false)
   A,B両方のis_matched=trueに更新
      |
5. マッチング成立モーダル
   (両ユーザーに表示)
      |
6. チャットページへ遷移
   メッセージ交換
      |
7. どちらかがキャンセル
   match.is_canceled=true
   A,Bのis_matched=false, recruiting_since=現在時刻に更新
   相互Like(A→B, B→A)をlikesテーブルから削除
      |
8. 両者ともユーザー一覧画面へ戻る
```

### 6.5 画面遷移と状態変化の対応図

ユーザーの画面遷移とデータベース状態の対応関係を示します：

```
画面遷移                    データベース状態変化
---------------------------------------------------------
1. セットアップ画面(/setup)
   ↓ OK保存                  users.is_matched=false
                              users.recruiting_since=現在時刻
   ↓
2. ユーザー一覧画面(/users)
   ↓ いいね                   likes テーブルにレコード追加
   ↓ 相互いいね                users.is_matched=true
                              matches テーブルにレコード追加
   ↓
3. チャット画面(/chat)
   ↓ メッセージ送信           messages テーブルにレコード追加
   ↓ キャンセル               matches.is_canceled=true
                              users.is_matched=false
                              users.recruiting_since=現在時刻
                              相互Like(A→B, B→A)をlikesテーブルから削除
   ↓
4. ユーザー一覧画面(/users)    (再度マッチング可能な状態)
```

---

## 7. データベース最適化

### 7.1 インデックス定義詳細

以下のインデックスを設定して検索パフォーマンスを最適化します：

| テーブル    | インデックス名          | カラム                       | 用途                                      |
|------------|------------------------|----------------------------|------------------------------------------|
| users      | idx_users_unmatched   | (is_matched)           | ユーザー一覧検索の高速化                      |
| users      | idx_users_ghost        | (is_matched, recruiting_since) | ゴーストユーザー検出の効率化         |
| likes      | idx_likes_combo        | (from_user_id, to_user_id) | 相互いいね検出の高速化とユニーク制約         |
| likes      | idx_likes_to_user      | (to_user_id)               | 特定ユーザーへのいいね検索                 |
| likes      | idx_likes_today        | (created_at)               | 当日のいいねフィルタリング                 |
| matches    | idx_matches_active_1   | (user_id_1, is_canceled)   | ユーザー別アクティブマッチ検索             |
| matches    | idx_matches_active_2   | (user_id_2, is_canceled)   | ユーザー別アクティブマッチ検索（逆方向）    |
| messages   | idx_messages_match     | (match_id, created_at)     | チャット履歴取得の高速化                   |

### 7.2 パフォーマンス最適化クエリ

以下に想定される高負荷クエリとその最適化例を示します：

#### 募集中ユーザー取得（高頻度実行）

以下が、ユーザー一覧画面で使用される標準的なクエリです：

```sql
-- ユーザー一覧表示用の標準クエリ
SELECT id, nickname, grade, department, end_time, place
FROM users
WHERE is_matched = false
  AND recruiting_since > NOW() - INTERVAL '20 minutes'
  AND id != :current_user_id
ORDER BY recruiting_since DESC;
```

このクエリは以下の条件でユーザーをフィルタリングします：
1. 未マッチのユーザーのみ（`is_matched = false`）
2. 20分以内に募集開始したユーザーのみ（`recruiting_since > NOW() - INTERVAL '20 minutes'`）
3. 自分自身を除外（`id != :current_user_id`）

### 7.3 数値ID採用の理由

MVPでは開発効率とパフォーマンスを優先し、すべての主キーに自動採番の数値ID(bigserial)を採用。
これによりインデックス効率の向上、JOIN操作の高速化、デバッグの容易さを実現。
セキュリティ要件が低いMVP段階では、UUIDよりも実装の簡便さを優先。

### 7.4 トランザクション処理とデータ整合性

マッチング処理では複数のテーブル更新が連続して行われるため、トランザクションによる一貫性の確保が重要です。

#### 7.4.1 マッチング処理のトランザクション

相互Likeの判定からマッチ成立までを単一トランザクションで処理することで、データ整合性を確保します：

```sql
-- マッチング処理のトランザクション例
BEGIN;

-- 1. Likeを登録
INSERT INTO likes (from_user_id, to_user_id, created_at)
VALUES (:from_user_id, :to_user_id, CURRENT_TIMESTAMP);

-- 2. 相互Likeを確認（当日のみ）
SELECT EXISTS (
  SELECT 1
  FROM likes
  WHERE from_user_id = :to_user_id
    AND to_user_id = :from_user_id
    AND date_trunc('day', created_at) = date_trunc('day', CURRENT_TIMESTAMP)
) AS is_mutual_like;

-- 3. 相互Likeが確認できたら、マッチを作成
INSERT INTO matches (id, user_id_1, user_id_2, created_at, is_canceled)
VALUES (gen_random_uuid(), :from_user_id, :to_user_id, CURRENT_TIMESTAMP, false);

-- 4. 両ユーザーの募集状態を更新
UPDATE users
SET is_matched = true
WHERE id IN (:from_user_id, :to_user_id);

COMMIT;
```

#### 7.4.2 競合状態への対応

マッチング処理では、以下の競合状態が発生する可能性があります：

1. 同時に相互Likeが発生する場合
2. 既に他のユーザーとマッチング中のユーザーへのLike
3. 部分的な処理成功によるデータ不整合

これらの問題を防ぐため：

- サーバーサイドでの**ストアドプロシージャ**を活用（Supabaseの場合はRPC）
- データベースの制約（**ユニークインデックス**）で重複マッチを防止
- **トランザクション**内でのすべての処理で一貫性を確保

### 7.5 テーブル設計選択の理由

- MVPではユーザープロフィールとステータス情報を単一テーブルで管理し、JOINを減らして開発を簡素化
- 将来的な拡張性を考慮しつつ、現段階では最も単純な構造を採用

### 7.6 キャッシュ戦略

MVPでは以下のシンプルなキャッシュ戦略を採用し、データベースへの負荷を軽減します：

1. **フロントエンドキャッシュ（SWR）**:
   - **募集中ユーザー一覧**: 30秒間のキャッシュ（stale-while-revalidate）
   - **プロフィール情報**: 変更頻度の低いデータは5分間キャッシュ
   - **マッチング情報**: アクティブなマッチは1分間キャッシュ

2. **キャッシュの選択基準**:
   - 更新頻度の低いデータ（プロフィール）: 長めのキャッシュ期間
   - 更新頻度の高いデータ（メッセージ）: キャッシュなし、リアルタイム取得
   - 中間的なデータ（ユーザーリスト）: 短めのキャッシュと手動リロードの併用

3. **キャッシュ無効化トリガー**:
   - ユーザーによる明示的なリロード操作
   - ステータス更新やマッチング成立などの重要なアクション実行後

この最小限のキャッシュ戦略により、開発負荷を抑えながらサーバー負荷とレスポンス時間の最適化を実現します。

注: MVP後のスケール対応として、ユーザープロフィールとステータスのテーブル分割、キャッシュ戦略の最適化などを検討予定。

---

## 8. リアルタイム通信実装

### 8.1 ポーリング方式の採用とユーティリティ設計

MVPではリアルタイム通信（WebSocket）の実装を省略し、定期的なポーリングによるシンプルな実装方法を採用します。複数の機能で必要なポーリング処理を共通ユーティリティとして設計し、コード重複を防ぎながら効率的な開発を実現します。

#### 8.1.1 共通ポーリングユーティリティの設計方針

```
【共通ポーリングユーティリティの主要機能】

1. 機能によって最適な間隔設定
   - チャット機能: 3秒間隔（即時性重視）
   - マッチング確認: 7秒間隔（バランス重視）

2. リソース最適化機能
   - バックグラウンド時の自動停止
   - 画面遷移時の自動停止
   - 条件達成時のポーリング自動停止オプション

3. エラーハンドリング
   - 通信エラーの検出と状態保持
   - 再試行メカニズム
```

このユーティリティは、React Hooks形式で設計し、各機能に共通して必要なポーリングの基盤機能を提供します。具体的な実装はフェーズ3で行い、フェーズ4の各機能で活用します。

### 8.2 機能別ポーリング実装方針

#### 8.2.1 チャット機能のポーリング

チャット機能では、以下の方針でポーリング実装を行います：

- **対象データ**: マッチングIDに紐づくメッセージ一覧
- **更新間隔**: 3秒間隔（即時性とサーバー負荷のバランス）
- **リソース管理**:
  - 非表示タブ時の自動停止
  - 画面遷移時の自動停止

#### 8.2.2 マッチング確認のポーリング

ユーザー一覧画面では、以下の方針でマッチング状態確認を行います：

- **対象データ**: 自分のマッチング状態とマッチ詳細
- **更新間隔**: 7秒間隔（チャットよりも低頻度）
- **最適化手法**:
  - 2段階クエリ：自分のマッチング状態確認を先に行い、マッチしている場合のみ詳細情報を取得
  - これにより不要な詳細情報取得を減らし、データ転送量を最適化
- **特殊機能**:
  - 成功時自動停止：マッチ検出後はポーリングを自動停止
  - マッチ検出時の自動通知とチャット画面への遷移

### 8.3 効率的な実装のポイント

1. **最適なクエリ設計**
   - 必要最小限のデータのみ取得
   - 条件付きクエリによる転送量削減
   - インデックスを活用した効率的な検索

2. **リソース消費の最適化**
   - ユースケースに合わせた更新頻度設定
   - 不要時のポーリング停止によるバッテリー消費抑制

3. **UX向上のためのフィードバック**
   - ローディング状態の視覚的表示
   - エラー発生時の適切な通知
   - 最新データ取得時刻の表示

### 8.4 将来の拡張性

ポーリングベースの実装は、将来的なリアルタイム通信への移行を考慮し、以下の点に注意して設計します：

1. **データと表示の分離**
   - データ取得ロジックとUI更新処理の明確な分離
   - 将来的にWebSocketなどに切り替える際もUI層への影響を最小限に

2. **段階的な最適化パス**
   - MVPフェーズ: ポーリングによるシンプルな実装
   - 利用分析後: 間隔や条件の最適化
   - 将来拡張: 必要に応じてWebSocketベースの実装に移行

---

## 9. タイムゾーン処理の詳細

> 注: [セクション3.6 (タイムゾーン処理)](#36-タイムゾーン処理)の内容を詳細に説明します。

### 9.1 環境設定

MVPでは開発の簡素化のため、以下の環境設定を行います：

- **サーバー環境**: タイムゾーンをJST（Asia/Tokyo）に設定
- **データベース環境**: PostgreSQLのタイムゾーンをJST（Asia/Tokyo）に設定
- **クライアント環境**: 日本国内利用を前提とし、ブラウザのローカルタイムゾーンを使用

この設定により、すべての環境で一貫してJSTでの日時処理が可能になり、複雑なタイムゾーン変換が不要になります。

### 9.2 データベース設定例

PostgreSQLの設定例：

```sql
-- データベースのタイムゾーンをJSTに設定
ALTER DATABASE lunchnow SET timezone TO 'Asia/Tokyo';

-- セッションのタイムゾーンを確認
SHOW timezone;  -- 'Asia/Tokyo'が返されることを確認
```

### 9.3 シンプルな日付比較

「当日」のデータのみを取得する場合のシンプルなクエリ例：

```sql
-- 「当日」のデータを取得する最もシンプルなクエリ
SELECT * FROM likes
WHERE DATE(created_at) = CURRENT_DATE;
```

### 9.4 フロントエンド側の実装

フロントエンドでの日時フォーマット表示例：

```typescript
// day.jsを使用した時刻フォーマット例（タイムゾーン変換不要）
import dayjs from 'dayjs';

// タイムスタンプ型の日時をフォーマット（チャットメッセージ用など）
const formatTimestamp = (timestamp: string) => {
  return dayjs(timestamp).format('HH:mm');
};

// 「今日」かどうかの判定
const isToday = (timestamp: string) => {
  return dayjs(timestamp).isSame(dayjs(), 'day');
};

// end_timeはすでに文字列形式なのでフォーマット不要
// 例: "~14:00" などの値をそのまま表示
```

### 9.5 MVPでの方針

MVPでは以下のシンプルなアプローチを採用します：

1. すべての環境をJST固定に設定し、タイムゾーン変換のロジックを完全に排除
2. 日付比較は `CURRENT_DATE` や `DATE(timestamp)` などのシンプルな関数を使用し、明示的なタイムゾーン指定を省略
3. フロントエンドでは、タイムスタンプ型の日時データについてはフォーマットを適用、文字列型の`end_time`についてはそのまま表示
4. `end_time`は文字列型（"~HH:MM"形式）で直接保存することで、タイムゾーン変換処理を省略

これにより、タイムゾーン処理に関する複雑さを大幅に削減し、開発効率を向上させます。この方針は「設定の時点でタイムゾーンを統一する」および「シンプルなデータ型を使用する」というアプローチを徹底するものです。

---

## 10. データ量想定と拡張性

### 10.1 初期フェーズの想定データ量

| テーブル   | 1日あたりの想定データ量 | 月間データ量 | 備考                                |
|-----------|-------------------|-----------|-------------------------------------|
| users     | 約100レコード       | 約3,000    | 一度作成したら継続利用                |
| statuses  | 約100レコード       | 約3,000    | ユーザーごとに1レコード               |
| likes     | 約500レコード       | 約15,000   | ユーザー1人あたり平均5いいね           |
| matches   | 約50レコード        | 約1,500    | いいねの約10%がマッチに至ると想定      |
| messages  | 約1,000レコード     | 約30,000   | マッチ1組あたり平均20メッセージと想定   |

### 10.2 拡張戦略

MVPフェーズを超えて成長した場合の戦略：

1. **インデックス最適化**
   - 利用パターンに基づいた追加インデックスの設定
   - 特に `likes` と `messages` テーブルは成長が速いため注視

2. **パーティショニング検討**
   - 日付でのパーティショニング（特にメッセージテーブル）
   - 古いデータの別テーブルへの移行（アーカイブ）

3. **キャッシュ戦略**
   - 頻繁にアクセスされる募集中ユーザーリストのキャッシュ導入
   - Supabase上でのRow-Level Securityの最適化

4. **拡張時の注意点**
   - リアルタイム通信量の増加に伴う最適化
   - バッチ処理の実行間隔とパフォーマンスのバランス調整

---
