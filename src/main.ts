import { Client } from 'discord.js'
import { applyRole, getConfig, getSourceUserRoles } from './utlis'

const client = new Client({
  intents: ['Guilds', 'GuildMembers'],
})

export function getClient() {
  return client
}

async function syncRole() {
  console.log('syncRole()')
  const roleUsers = await getSourceUserRoles(client)
  await applyRole(client, roleUsers)
}

client.on('ready', async () => {
  console.log(`ready: ${client.user?.tag}`)

  await syncRole()
  client.destroy()
})

client
  .login(getConfig().discordToken)
  .then(() => console.log('Login Successful.'))
