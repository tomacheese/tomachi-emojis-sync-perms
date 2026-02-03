# GitHub Copilot Instructions

## プロジェクト概要
- 目的: Discord サーバー間でのロール権限同期（Tomachi Emojis 用）
- 主な機能: ソースサーバーのロール保持状況を監視し、設定された複数の宛先サーバーに対してロールを同期する。
- 対象ユーザー: Discord サーバー管理者、Tomachi Emojis 管理者

## 共通ルール
- 会話は日本語で行う。
- PR とコミットは [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) に従う。
  - `<description>` は日本語で記載する。
- 日本語と英数字の間には半角スペースを入れる。

## 技術スタック
- 言語: TypeScript
- フレームワーク: discord.js (v14)
- パッケージマネージャー: pnpm
- ユーティリティ: @book000/node-utils

## 開発コマンド
```bash
# 依存関係のインストール
pnpm install

# 開発（自動リロード）
pnpm dev

# ビルド
pnpm compile

# テスト
pnpm test

# Lint 実行
pnpm lint

# Lint 自動修正
pnpm fix
```

## コーディング規約
- フォーマット: Prettier
- 命名規則: camelCase (変数・関数), PascalCase (クラス・インターフェース)
- コメント: 日本語で記載し、特に公開メソッドには JSDoc を付与する。
- TypeScript: `skipLibCheck` による型チェック回避は禁止。

## テスト方針
- テストフレームワーク: Jest (ts-jest)
- 単体テストを `src/*.test.ts` に配置する。

## セキュリティ / 機密情報
- Discord トークンなどの機密情報は `data/config.json` で管理し、絶対に Git にコミットしない。
- ログに個人情報や機密情報を出力しない。

## リポジトリ固有
- ロール同期設定は `data/linking.yml` で定義される。
- `@book000/node-utils` の `ConfigFramework` や `Logger` を積極的に利用する。
