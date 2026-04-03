import { Client, GatewayIntentBits, Partials } from 'discord.js'
import { Logger } from '@book000/node-utils'
import { Configuration } from './config'
import { Linking } from './linking'
import { setInterval } from 'node:timers/promises'

export type RoleUsers = Record<string, string[] | undefined>

export class Discord {
  private config: Configuration
  public readonly client: Client

  constructor(config: Configuration) {
    const logger = Logger.configure('Discord.constructor')
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
      ],
      partials: [Partials.Message, Partials.Channel, Partials.User],
    })
    this.client.on('ready', () => {
      this.onReady().catch((err: unknown) => {
        logger.error('Error', err as Error)
      })
    })

    this.config = config

    this.client.login(config.get('discord').token).catch((err: unknown) => {
      logger.error('Error', err as Error)
    })
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
      for (const role of roles) {
        if (!member.roles.cache.has(role.roleId)) {
          continue
        }
        logger.info(`✨ Member ${member.user.tag} has role ${role.type}`)
        if (role.type in roleUsers && roleUsers[role.type]) {
          roleUsers[role.type]?.push(member.id)
        } else {
          roleUsers[role.type] = [member.id]
        }
      }
    }

    return roleUsers
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
        for (const roleConfig of guildConfig.roles) {
          logger.info(
            `🔄 Processing member: ${member.user.tag} <- ${roleConfig.type}`
          )
          if (!roleUsers[roleConfig.type]) {
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for await (const _ of setInterval(10 * 60 * 1000)) {
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
