import { Client, Intents } from 'discord.js'
import { applyRole, getConfig, getSourceUserRoles } from './utlis'

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS],
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

  setInterval(() => {
    syncRole()
  }, 10 * 60 * 1000) // 10分おきに同期
})

client
  .login(getConfig().discordToken)
  .then(() => console.log('Login Successful.'))
