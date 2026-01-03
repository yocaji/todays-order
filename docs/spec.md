# 今日の順番 Webアプリ仕様書

## 1. 概要

振り返り会当日に、参加者の発表順をランダムに決めるための、シンプルな1ページWebアプリ。

- タイトル: 「今日の順番」
- 対象: 1つの輪読会専用
- 参加人数: 4人（最大で6人程度）
- 参加者名は `.env` / Vercel の Environment Variables 経由で設定する
- デプロイ先: Vercel
- 認証: なし（URLを知っている人だけがアクセスする前提）

この spec に沿って、GitHub Copilot でコードを補完・生成する。

## 2. 開発方針

### 2.1 設計原則

- **シンプルさ優先**: 過度な抽象化を避ける
- **型安全性**: TypeScriptの型システムを最大限活用
- **イミュータブル**: readonly を徹底し、意図しない変更を防ぐ

### 2.2 技術スタック

- **フレームワーク**: React + TypeScript
- **ビルドツール**: Vite
- **ルーティング**: 不要
  - ルート `/` に1ページだけを表示する
- **テスト**:
  - 受け入れ/E2E
    - Playwright + playwright-bdd
  - 単体/コンポーネント
    - Vitest + React Testing Library

- **環境変数**:
  - `VITE_PARTICIPANTS`: カンマ区切りの参加者名
    - 例: `VITE_PARTICIPANTS="Alice,Bob,Charlie,David"`
    - Viteではクライアントに公開する環境変数に `VITE_` プレフィックスが必要
  - ローカル開発時:
    - `.env.local` に `VITE_PARTICIPANTS` を定義
      - `.env.local` は Git にコミットしない
  - 本番（Vercel）:
    - Project Settings → Environment Variables で `VITE_PARTICIPANTS` を定義

### 2.3 開発フェーズ

BDDに基づいて以下の順番で実装する。
設計（spec.md）→featureの記述→テストの実装→実装

#### フェーズ1: プロジェクトセットアップ
- Vite + React + TypeScript プロジェクト作成
- 依存関係のインストール
- テストツールの準備
- ディレクトリ構造の作成
- 設定ファイル作成

#### フェーズ2: データ層の実装
- 単体テストの作成
- `parseParticipants.ts`: 環境変数のパース処理
- `shuffle.ts`: Fisher-Yatesシャッフル実装

#### フェーズ3: 画面実装
- featuresに基づいたE2Eテストの実装
- `App.tsx`: メインコンポーネント実装
- スタイリング（CSS）
- コンポーネントテストの作成

#### フェーズ4: テストとブラッシュアップ
1. ユニットテスト
2. 統合テスト
3. E2Eテスト（主要フロー）

## 3. 機能要件

### 3.1 参加者の読み込み

- 環境変数 `VITE_PARTICIPANTS` を読み込み、参加者名の配列として扱う。
- アクセス方法: `import.meta.env.VITE_PARTICIPANTS`
- 参加者名は以下の処理を行うこと:
  - 先頭と末尾の空白をトリムする
  - 空文字列は配列から除外する
- 想定する参加者数:
  - 最低1名以上
  - 最大6名程度（それ以上でも壊れないがUI最適化は不要）

**エラー・フォールバック:**

- `VITE_PARTICIPANTS` が未定義または空の場合:
  - ページ上部にエラー表示:  
    - メッセージ例: `環境変数 VITE_PARTICIPANTS が設定されていません。`
  - シャッフルボタンは非活性または押しても何も起こらないようにする。

### 3.2 参加者パース処理

- 環境変数 `VITE_PARTICIPANTS` をカンマで分割
- 各要素の前後空白をトリム
- 空文字列は除外

### 3.3 ランダムシャッフル機能

- 挙動:
  - ボタン「順番を決める」を押すたびに、現在の参加者リストをランダム順に並べ替える。
  - 並べ替えられた順番を画面に表示する。
- 実装要件:
  - Fisher-Yates shuffle など、バイアスの少ないアルゴリズムを使用する（単なる `sort(() => Math.random() - 0.5)` は避ける）。
  - シャッフルはクライアントサイドで実行してよい（セキュリティ要求は特にない）。

- 乱数の再現性:
  - シードなどによる再現性は不要。
  - ページをリロードするたびに結果が変わってよい。

### 3.4 UI 仕様

#### ページ構成

1ページのみ（ルート `/`）。

上から順に:

1. タイトル
   - 文言: `今日の順番`
   - HTML上は `<h1>` などの見出しタグで表示

2. 参加者一覧
   - 文言例: `参加者: Alice / Bob / Charlie / David`
   - 参加者名は `VITE_PARTICIPANTS` を読み込んだ配列から生成
   - 区切り文字は `/`（スペースを挟む）

3. ボタン
   - 文言: `順番を決める`
   - 振る舞い:
     - クリック時に参加者配列をシャッフルし、その結果を状態として保持
     - `VITE_PARTICIPANTS` が未設定、または参加者配列が空の場合は押せないようにする（`disabled`）

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

#### スタイル（ざっくり）

- レイアウト:
  - ページ中央寄せ（縦方向は任意、横方向は中央でも左寄せでもよい）
  - シンプルな余白とフォントサイズ調整のみでOK
- レスポンシブ:
  - PCブラウザで問題なく表示できればよい
  - スマホ表示で極端に崩れなければ十分

### 3.5 メタ情報

#### ドキュメントタイトル

- `<head>` の `<title>`:
  - 文言: `今日の順番`

#### アクセシビリティ（最低限）

- ボタンに `aria-label` を付与してもよいが、ボタンテキストが意味を持っているため必須ではない。
- 結果リストは `ol` / `li` などの適切なリストタグで表示する。

### 3.6 今後の拡張余地

現時点では実装不要。MVPでは上記の仕様のみ実装する。

- 「前回の結果」を1回分だけ表示する履歴機能
- 「同じ人が連続で1番になりにくい」ような簡易バイアス調整
- 発表順を固定して共有するためのURL生成（クエリパラメータなど）

## 4. BDDテスト仕様

### 4.1 Gherkin Featureシナリオ

詳細は [features/todays-order.feature](../features/todays-order.feature) を参照。

### 4.2 単体テスト要件

#### Fisher-Yatesシャッフル（簡易検証）

- 入力配列と出力配列の長さが同じ
- 入力配列の全要素が出力配列に含まれる
- 複数回実行で異なる順序が生成されうる（決定論的でない）

#### 参加者パース

- カンマ区切りで分割される
- 各要素の前後空白がトリムされる
- 空文字列が除外される

### 4.3 ディレクトリ構成

```
/
├── src/
│   ├── App.tsx                       # メインコンポーネント
│   ├── main.tsx                      # エントリーポイント
│   ├── index.css                     # スタイル
│   ├── vite-env.d.ts                 # Vite型定義
│   └── lib/
│       ├── shuffle.ts                # Fisher-Yatesシャッフル
│       ├── parseParticipants.ts      # 参加者パース
│       └── __tests__/
│           ├── shuffle.test.ts       # シャッフル単体テスト
│           └── parseParticipants.test.ts  # パース単体テスト
├── features/
│   ├── todays-order.feature          # Gherkinシナリオ
│   └── step-definitions/
│       └── todays-order.steps.ts     # ステップ定義
├── e2e/
│   └── todays-order.spec.ts          # 追加E2Eテスト（任意）
├── index.html                        # HTMLテンプレート
├── package.json
├── tsconfig.json
├── vite.config.ts
├── playwright.config.ts
├── vitest.config.ts
└── .github/
    └── workflows/
        └── test.yml                  # CI設定
```

### 4.4 npm scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test:unit": "vitest run",
    "test:e2e": "playwright test",
    "test": "vitest run && playwright test"
  }
}
```

### 4.5 依存関係のインストール

```bash
# プロジェクト作成
npm create vite@latest . -- --template react-ts

# テスト関連
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom jsdom
npm install -D playwright @playwright/test playwright-bdd
npx playwright install
```

### 4.6 CI設定（GitHub Actions）

- トリガー: `push` および `pull_request`（main/masterブランチ）
- ジョブ:
  1. Node.js セットアップ
  2. 依存関係インストール (`npm ci`)
  3. 単体テスト実行 (`npm run test:unit`)
  4. Playwrightインストール (`npx playwright install --with-deps`)
  5. E2Eテスト実行 (`npm run test:e2e`)
