# 今日の順番

振り返り会の発表順をランダムに決めるシンプルな1ページWebアプリ。

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` を作成し、参加者名をカンマ区切りで設定:

```bash
PARTICIPANTS="Alice,Bob,Charlie,David"
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

## 本番デプロイ (Vercel)

1. Vercel にプロジェクトをインポート
2. Project Settings → Environment Variables で `PARTICIPANTS` を設定
3. デプロイ

## テスト

### インストール

```bash
npm install -D playwright @playwright/test playwright-bdd
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom jsdom
npx playwright install
```

### 実行

```bash
# 単体テスト
npm run test:unit

# E2Eテスト
npm run test:e2e

# 全テスト
npm run test
```

## npm scripts

| コマンド | 説明 |
|----------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド |
| `npm run start` | 本番サーバー起動 |
| `npm run test:unit` | 単体テスト実行 |
| `npm run test:e2e` | E2Eテスト実行 |
| `npm run test` | 全テスト実行 |

## ディレクトリ構成

```
/
├── src/
│   ├── app/                # Next.js App Router
│   ├── components/         # Reactコンポーネント
│   └── lib/                # ユーティリティ関数
├── features/               # Gherkinシナリオ
│   ├── todays-order.feature
│   └── step-definitions/
├── docs/
│   └── spec.md             # 仕様書
├── .github/
│   └── workflows/
│       └── test.yml        # CI設定
├── playwright.config.ts
├── vitest.config.ts
└── README.md
```

## 仕様

詳細は [docs/spec.md](docs/spec.md) を参照。
