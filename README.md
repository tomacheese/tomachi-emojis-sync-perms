# tomachi-emojis-sync-perms

🔑 Tomachi Emojis Discord サーバー間でロール（権限）を同期するツールです。

## 概要

ソース Discord サーバーのロール情報を取得し、複数の宛先 Discord サーバーに同期します。Tomachi Emojis の複数サーバー間で権限を一元管理するために使用します。

## 機能

- ソースサーバーからロール情報を取得
- 複数の宛先サーバーにロールを同期
- 定期的な自動同期

## 必要要件

- Node.js（`.node-version` 参照）
- pnpm
- Discord Bot Token（適切な権限が必要）

## インストール

```bash
# リポジトリのクローン
git clone https://github.com/tomacheese/tomachi-emojis-sync-perms.git
cd tomachi-emojis-sync-perms

# 依存関係のインストール
pnpm install
```

## 設定

`data/config.json` を作成し、Discord Bot の設定とサーバー情報を記載します。

```json
{
  "discord": {
    "token": "your-discord-bot-token"
  },
  "linkings": [
    {
      "source": {
        "guildId": "source-server-id",
        "roles": [
          { "type": "admin", "roleId": "role-id" }
        ]
      },
      "destinations": [
        {
          "guildId": "destination-server-id",
          "roles": [
            { "type": "admin", "roleId": "role-id" }
          ]
        }
      ]
    }
  ]
}
```

## 使用方法

```bash
# 実行
pnpm start

# 開発モード（ファイル変更を監視）
pnpm dev
```

## Docker での実行

```bash
docker compose up -d
```
