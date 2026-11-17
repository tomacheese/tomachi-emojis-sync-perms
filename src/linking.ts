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

    this.validateElements(data as ILinking)

    return true
  }

  /**
   * 配列の各要素が必要なフィールドを持つことを検証する。
   * 最初に見つかった不備を、要素の添字を含む経路付きの例外として投げる。
   *
   * @param data 配列かどうかの検証を通過したリンク情報
   */
  private validateElements(data: ILinking): void {
    for (const [i, role] of data.sourceGuild.roles.entries()) {
      this.validateRole(role, `sourceGuild.roles[${i}]`)
    }

    for (const [i, guild] of data.destGuilds.entries()) {
      const path = `destGuilds[${i}]`
      this.assertValid(this.isObject(guild), `${path} is object`)
      this.assertValid(
        typeof guild.guildId === 'string',
        `${path}.guildId is string`
      )
      this.assertValid(Array.isArray(guild.roles), `${path}.roles is array`)
      for (const [j, role] of guild.roles.entries()) {
        this.validateRole(role, `${path}.roles[${j}]`)
      }
    }
  }

  private validateRole(role: unknown, path: string): void {
    this.assertValid(this.isObject(role), `${path} is object`)
    this.assertValid(
      typeof (role as LinkRole).type === 'string',
      `${path}.type is string`
    )
    this.assertValid(
      typeof (role as LinkRole).roleId === 'string',
      `${path}.roleId is string`
    )
  }

  private isObject(value: unknown): boolean {
    return typeof value === 'object' && value !== null
  }

  private assertValid(condition: boolean, description: string): void {
    if (!condition) {
      throw new Error(`Linking validation failed: ${description}`)
    }
  }
}
