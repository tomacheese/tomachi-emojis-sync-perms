# GitHub Copilot Instructions

プロジェクト概要、開発コマンド、規約は [AGENTS.md](../AGENTS.md) を参照する。ここではレビュー時の重点だけを示す。

## レビュー時の重点確認点

- ログ / エラーメッセージは英語で、既存の絵文字プレフィックス形式に揃っているか。
- `src/discord.ts` の `applyRole` で、付与 / 剥奪の条件分岐 (`roles.cache.has`) が正しく、不要な API 呼び出しがないか。
- `guild.members.fetch()` は全メンバーを取得する。大規模ギルドでの負荷と、`catch` 漏れがないか。
- 設定形式を変える場合、`src/linking.ts` の `validate`、`src/config.ts` の `validates()`、README の更新漏れがないか。
- `skipLibCheck` などによる型チェック回避を導入していないか。
- Discord トークンなどの機密情報をコミットしていないか、ログへ出力していないか。

## 指摘不要なもの

- ログ / エラーメッセージ内の絵文字は意図した統一表現。
- 日本語のコメント、JSDoc、コミットの description は規約どおり。英語化を提案しない。
