# GitHub Copilot Instructions

GitHub Copilot のコードレビュー向け指示。このリポジトリの PR をレビューする際の観点を示す。

## プロジェクト概要
- 目的: Discord サーバー間でのロール（権限）同期（Tomachi Emojis 用）。
- 動作: ソースサーバーのメンバーのロール保持状況を取得し、複数の宛先サーバーへ同期する。`Discord.onReady` で起動後、10 分間隔で `sync()` を実行する。
- 技術スタック: TypeScript / discord.js v14 / pnpm / `@book000/node-utils`（`ConfigFramework`・`Logger`）。

## レビュー時の重点確認点
- **ログ／エラーメッセージ**: 既存コードは絵文字プレフィックス付きの英語メッセージ（例: `❌ Configuration is invalid`、`🔄 Syncing roles`）で統一されている。新規メッセージも同じ形式・英語であることを確認する。
- **ロール付与／剥奪ロジック**（`src/discord.ts` の `applyRole`）: 付与・剥奪の条件分岐（`roles.cache.has` による現状チェック）が正しく、不要な API 呼び出しや取り違えがないか確認する。
- **Discord API 呼び出し**: `guild.members.fetch()` は全メンバーを取得する。大規模ギルドでの負荷やエラーハンドリング（`catch` 漏れ）に注意する。
- **設定バリデーション**: `src/linking.ts` の `validate` と `src/config.ts` の `validates()` が設定構造の前提を担保している。設定形式を変更する場合、これらの更新漏れがないか確認する。
- **型安全性**: `skipLibCheck` などによる型チェック回避を導入していないか確認する。

## セキュリティ
- Discord トークンは `data/config.json` で管理する。トークン等の機密情報を Git にコミットしていないか、ログへ出力していないか確認する。

## コーディング規約（lint/formatter で強制）
- フォーマット: Prettier（`pnpm lint:prettier`）。
- Lint: ESLint（`@book000/eslint-config`、`pnpm lint:eslint`）。
- コメント・JSDoc は日本語。エラーメッセージは英語。

## フラグすべきでない既知パターン（誤検知回避）
- ログ／エラーメッセージ内の絵文字は意図的な統一表現であり、指摘不要。
- 日本語のコメント・JSDoc はプロジェクト標準であり、英語化を提案しない。
- 会話・コミットの `<description>` は日本語が規約。英語化を提案しない。
