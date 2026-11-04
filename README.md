# tomachi-emojis-sync-perms

🔑 Tomachi Emojis Discord サーバー間でロール（権限）を同期するツールです。

## 概要

ソース Discord サーバーのロール情報を取得し、複数の宛先 Discord サーバーに同期します。Tomachi Emojis の複数サーバー間で権限を一元管理するために使用します。

## 機能

- ソースサーバーからロール情報を取得
- 複数の宛先サーバーにロールを同期
- 起動直後と、その後 10 分ごとの自動同期
- ソース側にそのロールを持つメンバーが 1 人以上いる場合、ソース側でロールを失った宛先サーバーのメンバーからはロールを剥奪（ソース側の保持者が 0 人になったロール種別は処理がスキップされ、剥奪されない）

## 必要要件

- Node.js（`.node-version` 参照）
- pnpm
- Discord Bot Token（ロールの管理権限と、Server Members Intent・Message Content Intent の有効化が必要）

## インストール

```bash
# リポジトリのクローン
git clone https://github.com/tomacheese/tomachi-emojis-sync-perms.git
cd tomachi-emojis-sync-perms

# 依存関係のインストール
pnpm install
```

## 設定

設定は 2 つのファイルに分かれています。

### data/config.json

Discord Bot のトークンを設定します。

```json
{
  "discord": {
    "token": "your-discord-bot-token"
  }
}
```

### data/linking.yml

サーバー間のロール同期設定を YAML 形式で記載します。

```yaml
sourceGuild:
  guildId: "source-server-id"
  roles:
    - type: "admin"
      roleId: "role-id"

destGuilds:
  - guildId: "destination-server-id"
    roles:
      - type: "admin"
        roleId: "role-id"
```

## 使用方法

```bash
# 実行
pnpm start

# 開発モード（ファイル変更を監視）
pnpm dev
```

## Docker での実行

イメージ内の作業ディレクトリは `/app` で、`data/config.json` は `/app/data/config.json` から読み込まれます。`data/linking.yml` は環境変数 `LINKING_PATH` (イメージ内の既定値: `/data/linking.yml`) のパスから読み込まれます。

1. `data/config.json` と `data/linking.yml` を作成します
2. `compose.yaml` でボリュームマッピングを設定します

```yaml
services:
  app:
    build: .
    volumes:
      - type: bind
        source: ./data/config.json
        target: /app/data/config.json
      - type: bind
        source: ./data/linking.yml
        target: /data/linking.yml
    init: true
```

3. コンテナを起動します

```bash
docker compose up -d
```

### 環境変数

- `LINKING_PATH`: リンク設定ファイルのパス (デフォルト: `data/linking.yml`、Docker イメージでは `/data/linking.yml`)

`data/config.json` のパスは環境変数では変更できません。
