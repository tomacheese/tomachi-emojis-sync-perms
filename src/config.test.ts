import { Configuration } from './config'
import fs from 'node:fs'

// テスト用サブクラスでconfigを書き換え可能にする
class TestConfiguration extends Configuration {
  public setConfig(obj: any) {
    // @ts-expect-error テスト用にprivateを書き換え
    this.config = obj
  }
}

describe('Configuration', () => {
  const dummyPath = 'dummy-config.json'
  beforeAll(() => {
    fs.writeFileSync(dummyPath, '{}')
  })
  afterAll(() => {
    if (fs.existsSync(dummyPath)) fs.unlinkSync(dummyPath)
  })

  it('discord.tokenが正しい場合にvalidate()がtrue', () => {
    const config = new TestConfiguration(dummyPath)
    config.setConfig({ discord: { token: 'token' } })
    expect(config.validate()).toBe(true)
  })

  it('discordが未設定の場合にvalidate()がfalse', () => {
    const config = new TestConfiguration(dummyPath)
    config.setConfig({})
    expect(config.validate()).toBe(false)
  })

  it('discord.tokenが未設定の場合にvalidate()がfalse', () => {
    const config = new TestConfiguration(dummyPath)
    config.setConfig({ discord: {} })
    expect(config.validate()).toBe(false)
  })

  it('discord.tokenがstring以外の場合にvalidate()がfalse', () => {
    const config = new TestConfiguration(dummyPath)
    config.setConfig({ discord: { token: 123 } })
    expect(config.validate()).toBe(false)
  })
})
