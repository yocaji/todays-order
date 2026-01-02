# 今日の順番 Webアプリ仕様

## 概要

振り返り会当日に、参加者の発表順をランダムに決めるための、シンプルな1ページWebアプリ。

- タイトル: 「今日の順番」
- 対象: 1つの輪読会専用
- 参加人数: 4人（最大で6人程度）
- 参加者名は `.env` / Vercel の Environment Variables 経由で設定する
- デプロイ先: Vercel
- 認証: なし（URLを知っている人だけがアクセスする前提）

この spec に沿って、GitHub Copilot でコードを補完・生成する。

## 技術スタック・前提

- フレームワーク: Next.js (App Router) + TypeScript
- ホスティング: Vercel
- ルーティング:
  - ルート `/` に1ページだけを表示する
- 環境変数:
  - `PARTICIPANTS`: カンマ区切りの参加者名
    - 例: `PARTICIPANTS="Alice,Bob,Charlie,David"`

ローカル開発時:
- `.env.local` に `PARTICIPANTS` を定義
  - `.env.local` は Git にコミットしない

本番（Vercel）:
- Project Settings → Environment Variables で `PARTICIPANTS` を定義

## 機能仕様

### 1. 参加者の読み込み

- 環境変数 `PARTICIPANTS` を読み込み、参加者名の配列として扱う。
- 参加者名は以下の処理を行うこと:
  - 先頭と末尾の空白をトリムする
  - 空文字列は配列から除外する
- 想定する参加者数:
  - 最低1名以上
  - 最大6名程度（それ以上でも壊れないがUI最適化は不要）

**エラー・フォールバック:**

- `PARTICIPANTS` が未定義または空の場合:
  - ページ上部にエラー表示:  
    - メッセージ例: `環境変数 PARTICIPANTS が設定されていません。`
  - シャッフルボタンは非活性または押しても何も起こらないようにする。

### 2. ランダムシャッフル機能

- 挙動:
  - ボタン「順番を決める」を押すたびに、現在の参加者リストをランダム順に並べ替える。
  - 並べ替えられた順番を画面に表示する。
- 実装要件:
  - Fisher-Yates shuffle など、バイアスの少ないアルゴリズムを使用する（単なる `sort(() => Math.random() - 0.5)` は避ける）。
  - シャッフルはクライアントサイドで実行してよい（セキュリティ要求は特にない）。

- 乱数の再現性:
  - シードなどによる再現性は不要。
  - ページをリロードするたびに結果が変わってよい。

### 3. UI 仕様

#### 3.1 ページ構成

1ページのみ（ルート `/`）。

上から順に:

1. タイトル
   - 文言: `今日の順番`
   - HTML上は `<h1>` などの見出しタグで表示

2. 参加者一覧
   - 文言例: `参加者: Alice / Bob / Charlie / David`
   - 参加者名は `PARTICIPANTS` を読み込んだ配列から生成
   - 区切り文字は `/`（スペースを挟む）

3. ボタン
   - 文言: `順番を決める`
   - 振る舞い:
     - クリック時に参加者配列をシャッフルし、その結果を状態として保持
     - `PARTICIPANTS` が未設定、または参加者配列が空の場合は押せないようにする（`disabled`）

4. 結果表示
   - 初期状態:
     - シャッフル前は、「まだ決まっていない」ことが分かる表示にする
       - 例: `まだ順番が決まっていません。`
   - シャッフル実行後:
     - 下記のように1番から順に表示

     ```text
     今日の発表順:
     1. Bob
     2. David
     3. Alice
     4. Charlie
     ```

   - 表示仕様:
     - 固定文言: `今日の発表順:`
     - その下に番号付きリスト（`<ol>` または `1. ...` のスタイル）で名前を表示

#### 3.2 スタイル（ざっくり）

- レイアウト:
  - ページ中央寄せ（縦方向は任意、横方向は中央でも左寄せでもよい）
  - シンプルな余白とフォントサイズ調整のみでOK
- レスポンシブ:
  - PCブラウザで問題なく表示できればよい
  - スマホ表示で極端に崩れなければ十分

### 4. メタ情報

#### 4.1 ドキュメントタイトル

- `<head>` の `<title>`:
  - 文言: `今日の順番`

#### 4.2 アクセシビリティ（最低限）

- ボタンに `aria-label` を付与してもよいが、ボタンテキストが意味を持っているため必須ではない。
- 結果リストは `ol` / `li` などの適切なリストタグで表示する。

## 今後の拡張余地（任意）
- 「前回の結果」を1回分だけ表示する履歴機能
- 「同じ人が連続で1番になりにくい」ような簡易バイアス調整
- 発表順を固定して共有するためのURL生成（クエリパラメータなど）
現時点では実装不要。MVPでは上記の仕様のみ実装する。

---

## BDDテスト仕様

### テストツール構成

| 種別 | ツール | 用途 |
|------|--------|------|
| 受け入れ/E2E | Playwright + playwright-bdd | Gherkinシナリオの実行 |
| 単体/コンポーネント | Vitest + React Testing Library | ロジック・UIコンポーネントのテスト |

### Gherkin Featureシナリオ

```gherkin
Feature: 今日の順番アプリ

  Scenario: 環境変数から参加者を正常に読み込む
    Given 環境変数PARTICIPANTSに"Alice,Bob,Charlie,David"が設定されている
    When ページを開く
    Then 「参加者: Alice / Bob / Charlie / David」と表示される
    And 「順番を決める」ボタンが活性化されている

  Scenario: PARTICIPANTS未設定時にエラーメッセージを表示
    Given 環境変数PARTICIPANTSが未設定である
    When ページを開く
    Then 「環境変数 PARTICIPANTS が設定されていません。」とエラー表示される
    And 「順番を決める」ボタンが非活性である

  Scenario: ボタンクリックで順番をシャッフルする
    Given 参加者"Alice,Bob,Charlie,David"でページを開いている
    And 「まだ順番が決まっていません。」と表示されている
    When 「順番を決める」ボタンをクリックする
    Then 「今日の発表順:」と表示される
    And 4人の名前が番号付きリストで表示される

  Scenario: 複数回シャッフルできる
    Given シャッフル結果が表示されている状態
    When 「順番を決める」ボタンを再度クリックする
    Then 新しい順番で結果が更新される

  Scenario: 空文字やスペースのみの参加者を除外する
    Given 環境変数PARTICIPANTSに"Alice, ,Bob, Charlie ,,David"が設定されている
    When ページを開く
    Then 「参加者: Alice / Bob / Charlie / David」と表示される

  Scenario: 参加者が空の場合ボタンが押せない
    Given 環境変数PARTICIPANTSが空文字である
    When ページを開く
    Then 「順番を決める」ボタンがdisabled属性を持つ
```

### 単体テスト要件

#### Fisher-Yatesシャッフル（簡易検証）

- 入力配列と出力配列の長さが同じ
- 入力配列の全要素が出力配列に含まれる
- 複数回実行で異なる順序が生成されうる（決定論的でない）

#### 参加者パース

- カンマ区切りで分割される
- 各要素の前後空白がトリムされる
- 空文字列が除外される

### テストファイル構成

```
/
├── features/
│   ├── todays-order.feature          # Gherkinシナリオ
│   └── step-definitions/
│       └── todays-order.steps.ts     # ステップ定義
├── e2e/
│   └── todays-order.spec.ts          # 追加E2Eテスト（任意）
├── src/
│   └── lib/
│       └── __tests__/
│           ├── shuffle.test.ts       # シャッフル単体テスト
│           └── parseParticipants.test.ts  # パース単体テスト
├── playwright.config.ts
├── vitest.config.ts
└── .github/
    └── workflows/
        └── test.yml                  # CI設定
```

### CI設定（GitHub Actions）

- トリガー: `push` および `pull_request`（main/masterブランチ）
- ジョブ:
  1. Node.js セットアップ
  2. 依存関係インストール (`npm ci`)
  3. 単体テスト実行 (`npm run test:unit`)
  4. Playwrightインストール (`npx playwright install --with-deps`)
  5. E2Eテスト実行 (`npm run test:e2e`)

### 実行コマンド

**インストール:**

```bash
npm install -D playwright @playwright/test playwright-bdd
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom jsdom
npx playwright install
```

**npm scripts:**

```json
{
  "test:unit": "vitest run",
  "test:e2e": "playwright test",
  "test": "vitest run && playwright test"
}
```
