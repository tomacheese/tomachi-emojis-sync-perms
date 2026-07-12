import {
  Client,
  GatewayIntentBits,
  Guild,
  GuildMember,
  Partials,
} from 'discord.js'
import { Logger } from '@book000/node-utils'
import { Config } from './config'
import { Linking, LinkGuild, LinkRole } from './linking'
import { setInterval } from 'node:timers/promises'

export type RoleUsers = Record<string, string[] | undefined>

export class Discord {
  private config: Config
  public readonly client: Client

  constructor(config: Config) {
    const logger = Logger.configure('Discord.constructor')
    const client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
      ],
      partials: [Partials.Message, Partials.Channel, Partials.User],
    })
    this.client = client
    client.on('ready', () => {
      ;(async () => {
        try {
          await this.onReady()
        } catch (error) {
          logger.error('Error', error as Error)
        }
      })()
    })

    this.config = config

    ;(async () => {
      try {
        await client.login(config.get('discord').token)
      } catch (error) {
        logger.error('Error', error as Error)
      }
    })()
  }

  /**
   * ソースサーバのロールを取得
   *
   * @param linking リンク情報
   * @returns ユーザーロール
   */
  async getSourceUserRoles(linking: Linking): Promise<RoleUsers> {
    const logger = Logger.configure('Linking.getSourceUserRoles')
    const sourceGuildId = linking.getSourceGuild().guildId
    const roles = linking.getSourceGuild().roles

    logger.info(`🔍 Fetching guild ${sourceGuildId}`)
    const sourceGuild = await this.client.guilds.fetch(sourceGuildId)

    const roleUsers: RoleUsers = {}
    logger.info(`🔍 Fetching members of guild ${sourceGuildId}`)
    const members = await sourceGuild.members.fetch()
    for (const member of members.values()) {
      logger.info(`🔄 Processing member: ${member.user.tag}`)
      this.collectMemberRoles(member, roles, roleUsers)
    }

    return roleUsers
  }

  /**
   * メンバーが保持しているロールを roleUsers に集約する
   *
   * @param member 対象メンバー
   * @param roles ソースサーバのロール設定一覧
   * @param roleUsers 集約先の RoleUsers
   */
  private collectMemberRoles(
    member: GuildMember,
    roles: LinkRole[],
    roleUsers: RoleUsers
  ): void {
    const logger = Logger.configure('Linking.collectMemberRoles')
    for (const role of roles) {
      if (!member.roles.cache.has(role.roleId)) {
        continue
      }
      logger.info(`✨ Member ${member.user.tag} has role ${role.type}`)
      if (Object.hasOwn(roleUsers, role.type)) {
        roleUsers[role.type]?.push(member.id)
      } else {
        roleUsers[role.type] = [member.id]
      }
    }
  }

  /**
   * ロールを適用する
   *
   * @param linking リンク情報
   * @param roleUsers RoleUsers
   */
  async applyRole(linking: Linking, roleUsers: RoleUsers): Promise<void> {
    const logger = Logger.configure('Linking.applyRole')
    const destinationGuilds = linking.getDestGuilds()

    // 対象Guildすべてに対して適用
    for (const guildConfig of destinationGuilds) {
      const guildId = guildConfig.guildId
      logger.info(`🔍 Fetching guild ${guildId}`)
      const guild = await this.client.guilds.fetch(guildId)
      logger.info(`🔍 Fetching members of guild ${guildId}`)
      const members = await guild.members.fetch()
      for (const member of members.values()) {
        await this.syncMemberRoles(member, guild, guildConfig, roleUsers)
      }
    }
  }

  /**
   * メンバーに対して宛先サーバのロール設定一覧を反映する
   *
   * @param member 対象メンバー
   * @param guild 宛先サーバ
   * @param guildConfig 宛先サーバのロール設定
   * @param roleUsers ソースサーバで集約した RoleUsers
   */
  private async syncMemberRoles(
    member: GuildMember,
    guild: Guild,
    guildConfig: LinkGuild,
    roleUsers: RoleUsers
  ): Promise<void> {
    const logger = Logger.configure('Linking.syncMemberRoles')
    for (const roleConfig of guildConfig.roles) {
      logger.info(
        `🔄 Processing member: ${member.user.tag} <- ${roleConfig.type}`
      )
      if (!Object.hasOwn(roleUsers, roleConfig.type)) {
        continue
      }
      if (
        roleUsers[roleConfig.type]?.includes(member.id) &&
        !member.roles.cache.has(roleConfig.roleId)
      ) {
        logger.info(
          `✨ ${member.user.tag} give ${roleConfig.type} in ${guild.name}`
        )
        await member.roles.add(roleConfig.roleId)
      }
      if (
        !roleUsers[roleConfig.type]?.includes(member.id) &&
        member.roles.cache.has(roleConfig.roleId)
      ) {
        logger.info(
          `🚫 ${member.user.tag} take ${roleConfig.type} in ${guild.name}`
        )
        await member.roles.remove(roleConfig.roleId)
      }
    }
  }

  public getClient() {
    return this.client
  }

  public getConfig() {
    return this.config
  }

  public async close() {
    await this.client.destroy()
  }

  async onReady() {
    const logger = Logger.configure('Discord.onReady')
    logger.info(`👌 ready: ${this.client.user?.tag}`)

    // 10分ごとにロールを同期
    await this.sync()
    const syncInterval = setInterval(10 * 60 * 1000)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for await (const _ of syncInterval) {
      await this.sync()
    }
  }

  async sync() {
    const logger = Logger.configure('Discord.sync')
    logger.info('🔄 Syncing roles')

    const linkPath = process.env.LINKING_PATH ?? 'data/linking.yml'
    const linking = new Linking(linkPath)
    const roleUsers = await this.getSourceUserRoles(linking)
    await this.applyRole(linking, roleUsers)

    logger.info('👌 Synced roles')
  }

  waitReady() {
    return new Promise<void>((resolve) => {
      if (this.client.isReady()) {
        resolve()
      }
      this.client.once('ready', () => {
        resolve()
      })
    })
  }
}
