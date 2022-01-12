export interface ConfigRole {
  type: string
  roleId: string
}

export interface ConfigGuild {
  guildId: string
  roles: ConfigRole[]
}

export interface Config {
  discordToken: string
  sourceGuild: ConfigGuild
  destGuilds: ConfigGuild[]
}
