# AGENTS.md

## 言語ルール

- コミットの description、PR / Issue のタイトルと本文、コード内コメントと docstring、ドキュメントは日本語で書く。
- 日本語と英数字の間には半角スペースを入れる。
- 例外: 実行時のログ / エラーメッセージ (英語、絵文字プレフィックス付きの既存形式に合わせる)、引用、技術的な識別子、`package.json` (英語)。

## 概要

Tomachi Emojis 用の Discord ロール同期ボット。ソースサーバーのメンバーが持つロールを取得し、`data/linking.yml` で対応付けた複数の宛先サーバーのロールへ付与する。ソース側に保持者が 1 人以上いるロール種別に限り、ソース側で失ったメンバーから剥奪もする (保持者が 0 人のロール種別はスキップされ、剥奪されない)。起動直後と、その後 10 分ごと (`Discord.onReady` 内の `setInterval`) に同期する。

技術スタック: TypeScript / discord.js v14 / pnpm / `@book000/node-utils` (`Logger`, `ConfigFramework`) / js-yaml / Jest。

## 開発コマンド

```bash
pnpm install   # 依存関係のインストール
pnpm start     # 実行 (tsx)
pnpm dev       # ファイル変更を監視して実行
pnpm compile   # tsc でビルド
pnpm test      # Jest
pnpm lint      # Prettier / ESLint / tsc
pnpm fix       # Prettier / ESLint の自動修正
```

## アーキテクチャ

- `src/main.ts`: エントリーポイント。`data/config.json` を読み込んで検証し、`Discord` を起動する。SIGINT で `close()` する。
- `src/config.ts`: `data/config.json` の設定 (`discord.token`) と検証 (`validates()`)。
- `src/discord.ts`: Discord クライアントと同期ロジック (`getSourceUserRoles` / `applyRole` / `sync`)。
- `src/linking.ts`: `data/linking.yml` の読み込みと検証。パスは環境変数 `LINKING_PATH` で変更できる (デフォルト: `data/linking.yml`)。
- テストは `src/*.test.ts` に置く。

## 規約と不変条件

- ロール付与 / 剥奪は `roles.cache.has` で現状を確認してから API を呼ぶ。不要な呼び出しを増やさない。
- 設定形式を変えるときは `Linking.validate` と `Configuration.validates()`、README の更新漏れに注意する。
- `guild.members.fetch()` は全メンバーを取得する。例外は `catch` で処理し、握りつぶさない。
- ログ / エラーメッセージは英語で、既存の絵文字プレフィックス形式 (例: `❌ ...`, `🔄 ...`) に揃える。
- `skipLibCheck` など型チェックを回避する設定は導入しない。
- Discord トークン (`data/config.json`) をコミットしない。ログにも出力しない。
- Renovate が作成した PR には追加コミットしない。
