import yaml from 'js-yaml'
import fs from 'node:fs'

export interface LinkRole {
  type: string
  roleId: string
}

export interface LinkGuild {
  guildId: string
  roles: LinkRole[]
}

export interface ILinking {
  sourceGuild: LinkGuild
  destGuilds: LinkGuild[]
}

export class Linking {
  private linking!: ILinking
  private path: string

  constructor(path: string) {
    this.path = path

    this.load()
  }

  /**
   * リンクファイルを読み込む
   */
  public load(): void {
    if (!fs.existsSync(this.path)) {
      throw new Error('Linking file does not exist')
    }

    const linking = yaml.load(fs.readFileSync(this.path, 'utf8')) as ILinking
    if (!this.validate(linking)) {
      throw new Error('Linking validation failed')
    }

    this.linking = linking
  }

  /**
   * ソースサーバの設定状態を取得
   *
   * @returns ソースサーバの設定状態
   */
  public getSourceGuild(): LinkGuild {
    return this.linking.sourceGuild
  }

  /**
   * リンク先サーバの設定状態を取得
   *
   * @returns リンク先サーバの設定状態
   */
  public getDestGuilds(): LinkGuild[] {
    return this.linking.destGuilds
  }

  /**
   * 読み込んだリンク情報について、バリデーションを行う
   *
   * @param data 読み込んだリンク情報
   * @returns バリデーション結果
   */
  private validate(data: unknown): data is ILinking {
    const validates: Record<string, (data: unknown) => boolean> = {
      'data is object': (data: unknown) => {
        return typeof data === 'object' && data !== null
      },
      'sourceGuild is object': (data: unknown) => {
        return typeof (data as ILinking).sourceGuild === 'object'
      },
      'sourceGuild.guildId is string': (data: unknown) => {
        return typeof (data as ILinking).sourceGuild.guildId === 'string'
      },
      'sourceGuild.roles is object': (data: unknown) => {
        return typeof (data as ILinking).sourceGuild.roles === 'object'
      },
      'sourceGuild.roles is array': (data: unknown) => {
        return Array.isArray((data as ILinking).sourceGuild.roles)
      },
      'destGuilds is object': (data: unknown) => {
        return typeof (data as ILinking).destGuilds === 'object'
      },
      'destGuilds is array': (data: unknown) => {
        return Array.isArray((data as ILinking).destGuilds)
      },
    }

    for (const key in validates) {
      if (!validates[key](data)) {
        throw new Error(`Linking validation failed: ${key}`)
      }
    }

    return true
  }
}
