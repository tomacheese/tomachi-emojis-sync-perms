import { Discord, RoleUsers } from './discord'
import { Linking } from './linking'

// Discord.jsのClientモック型
interface MockClient {
  guilds: {
    fetch: jest.Mock
  }
  on: jest.Mock
  once: jest.Mock
  isReady: jest.Mock
  destroy: jest.Mock
  user: { tag: string }
  login: jest.Mock
}

jest.mock('discord.js', () => {
  const mClient: MockClient = {
    guilds: {
      fetch: jest.fn(),
    },
    on: jest.fn(),
    once: jest.fn(),
    isReady: jest.fn().mockReturnValue(true),
    destroy: jest.fn(),
    user: { tag: 'bot#0001' },
    login: jest.fn().mockResolvedValue(Promise.resolve()),
  }
  return {
    Client: jest.fn(() => mClient),
    GatewayIntentBits: {},
    Partials: {},
    __esModule: true,
  }
})

describe('Discord', () => {
  const config: any = { get: () => ({ token: 'token' }) }
  let discord: Discord
  let client: MockClient

  beforeEach(() => {
    discord = new Discord(config)
    client = discord.getClient() as unknown as MockClient
  })

  it('close: client.destroy()が呼ばれる', async () => {
    await discord.close()
    expect(client.destroy).toHaveBeenCalled()
  })

  it('getSourceUserRoles: ロールを持つ/持たないユーザーが正しく抽出される', async () => {
    const linking = {
      getSourceGuild: () => ({
        guildId: 'src',
        roles: [
          { type: 'admin', roleId: '1' },
          { type: 'user', roleId: '2' },
        ],
      }),
    } as Linking
    const member1 = {
      id: 'a',
      user: { tag: 'A' },
      roles: { cache: new Map([['1', true]]), has: () => true },
    }
    const member2 = {
      id: 'b',
      user: { tag: 'B' },
      roles: { cache: new Map([['2', true]]), has: () => true },
    }
    client.guilds.fetch.mockResolvedValue({
      members: {
        fetch: jest.fn().mockResolvedValue(
          new Map([
            ['a', member1],
            ['b', member2],
          ])
        ),
      },
    })
    const result = await discord.getSourceUserRoles(linking)
    expect(result.admin).toContain('a')
    expect(result.user).toContain('b')
  })

  it('applyRole: ロール付与/剥奪が正しく呼ばれる', async () => {
    const linking = {
      getDestGuilds: () => [
        {
          guildId: 'dst',
          roles: [{ type: 'admin', roleId: '1' }],
        },
      ],
    } as Linking
    const member = {
      id: 'a',
      user: { tag: 'A' },
      roles: {
        cache: new Map(),
        has: () => false,
        add: jest.fn(),
        remove: jest.fn(),
      },
    }
    const guild = {
      name: 'dst',
      members: { fetch: jest.fn().mockResolvedValue(new Map([['a', member]])) },
    }
    client.guilds.fetch.mockResolvedValue(guild)
    const roleUsers: RoleUsers = { admin: ['a'] }
    await discord.applyRole(linking, roleUsers)
    expect(member.roles.add).toHaveBeenCalledWith('1')
  })

  it('applyRole: 既にロールを持っている場合はaddが呼ばれない', async () => {
    const linking = {
      getDestGuilds: () => [
        {
          guildId: 'dst',
          roles: [{ type: 'admin', roleId: '1' }],
        },
      ],
    } as Linking
    const member = {
      id: 'a',
      user: { tag: 'A' },
      roles: {
        cache: new Map([['1', true]]),
        has: () => true,
        add: jest.fn(),
        remove: jest.fn(),
      },
    }
    const guild = {
      name: 'dst',
      members: { fetch: jest.fn().mockResolvedValue(new Map([['a', member]])) },
    }
    client.guilds.fetch.mockResolvedValue(guild)
    const roleUsers: RoleUsers = { admin: ['a'] }
    await discord.applyRole(linking, roleUsers)
    expect(member.roles.add).not.toHaveBeenCalled()
  })

  it('applyRole: ロールを持っていない場合removeが呼ばれない', async () => {
    const linking = {
      getDestGuilds: () => [
        {
          guildId: 'dst',
          roles: [{ type: 'admin', roleId: '1' }],
        },
      ],
    } as Linking
    const member = {
      id: 'a',
      user: { tag: 'A' },
      roles: {
        cache: new Map(),
        has: () => false,
        add: jest.fn(),
        remove: jest.fn(),
      },
    }
    const guild = {
      name: 'dst',
      members: { fetch: jest.fn().mockResolvedValue(new Map([['a', member]])) },
    }
    client.guilds.fetch.mockResolvedValue(guild)
    const roleUsers: RoleUsers = { admin: [] }
    await discord.applyRole(linking, roleUsers)
    expect(member.roles.remove).not.toHaveBeenCalled()
  })
})
