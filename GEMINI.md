# GEMINI.md

## 目的
Gemini CLI 向けのコンテキストと作業方針を定義する。

## 出力スタイル
- 言語: 日本語を使用する。
- トーン: プロフェッショナルかつ簡潔な CLI スタイル。
- 形式: Markdown を使用し、コード変更は明確に示す。

## 共通ルール
- 会話と言語: 日本語を使用する。
- コミット規約: [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) に従い、`<description>` は日本語で記載する。
- 日本語と英数字の間: 半角スペースを挿入する。

## プロジェクト概要
- 目的: Discord サーバー間でのロール権限同期（Tomachi Emojis 用）
- 主な機能: ソースサーバーからロール取得し、複数の宛先サーバーへ同期。

## コーディング規約
- フォーマット: Prettier。
- 命名規則: プロジェクトの既存コードに合わせる。
- コメント言語: 日本語。
- エラーメッセージ言語: 英語。

## 開発コマンド
```bash
# インストール
pnpm install

# コンパイル
pnpm compile

# 実行
pnpm start

# テスト
pnpm test

# Lint
pnpm lint
```

## 注意事項
- 認証情報（Discord トークン等）のコミットを厳禁する。
- 既存のアーキテクチャ（`@book000/node-utils` ベース）を尊重する。
- `skipLibCheck` による TypeScript エラーの無視を禁止する。

## リポジトリ固有
- `data/linking.yml` のバリデーション（`src/linking.ts`）に注意を払うこと。
- 非同期処理（`setInterval` による定期同期）の挙動を理解した上で改修を行うこと。
