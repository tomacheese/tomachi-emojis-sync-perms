import { Client } from 'discord.js'
import fs from 'fs'
import yaml from 'js-yaml'
import { Config } from './types/config'

export function getConfig(): Config {
  return yaml.load(fs.readFileSync('./config.yml', 'utf8')) as Config
}

type RoleUsers = { [key: string]: string[] }

/**
 * ソースサーバのロールを取得
 * @param client クライアント
 * @returns ユーザーロール
 */
export async function getSourceUserRoles(client: Client): Promise<RoleUsers> {
  console.log('getSourceUserRoles()')
  const config = getConfig()
  const sourceGuildId = config.sourceGuild.guildId
  console.log(`getSourceUserRoles(): Fetching guild ${sourceGuildId}`)
  const sourceGuild = await client.guilds.fetch(sourceGuildId)
  const roles = config.sourceGuild.roles

  const roleUsers: RoleUsers = {}
  console.log(`getSourceUserRoles(): get members`)
  const members = await sourceGuild.members.fetch()
  for (const member of members.values()) {
    console.log(`getSourceUserRoles(): process member: ${member.user.tag}`)
    for (const role of roles) {
      if (!member.roles.cache.has(role.roleId)) {
        continue
      }
      console.log(`getSourceUserRoles(): has ${role.type}`)
      if (roleUsers[role.type]) {
        roleUsers[role.type].push(member.id)
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
 * @param client Client
 * @param roleUsers RoleUsers
 */
export async function applyRole(client: Client, roleUsers: RoleUsers) {
  console.log('applyRole()')
  const config = getConfig()
  const destGuilds = config.destGuilds

  // 対象Guildすべてに対して適用
  for (const guildConfig of destGuilds) {
    const guildId = guildConfig.guildId
    console.log(`applyRole(): Fetching guild ${guildId}`)
    const guild = await client.guilds.fetch(guildId)
    console.log(`applyRole(): get members`)
    const members = await guild.members.fetch()
    for (const member of members.values()) {
      for (const roleConfig of guildConfig.roles) {
        console.log(`applyRole(): process member: ${member.user.tag}`)
        if (!roleUsers[roleConfig.type]) {
          continue
        }
        if (
          roleUsers[roleConfig.type].includes(member.id) &&
          !member.roles.cache.has(roleConfig.roleId)
        ) {
          console.log(
            `${member.user.tag} give ${roleConfig.type} in ${guild.name}`
          )
          await member.roles.add(roleConfig.roleId)
        }
        if (
          !roleUsers[roleConfig.type].includes(member.id) &&
          member.roles.cache.has(roleConfig.roleId)
        ) {
          console.log(
            `${member.user.tag} take ${roleConfig.type} in ${guild.name}`
          )
          await member.roles.remove(roleConfig.roleId)
        }
      }
    }
  }
}
