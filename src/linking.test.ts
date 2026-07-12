import fs from 'node:fs'
import yaml from 'js-yaml'
import { Linking, ILinking } from './linking'

describe('Linking', () => {
  const validData: ILinking = {
    sourceGuild: { guildId: 'src', roles: [{ type: 'admin', roleId: '1' }] },
    destGuilds: [{ guildId: 'dst', roles: [{ type: 'admin', roleId: '2' }] }],
  }
  const temporaryPath = 'temp-linking.yml'

  afterEach(() => {
    if (fs.existsSync(temporaryPath)) fs.unlinkSync(temporaryPath)
  })

  it('存在するYAMLファイルを読み込んだ場合、正しくパース・バリデーションされる', () => {
    fs.writeFileSync(temporaryPath, yaml.dump(validData))
    const linking = new Linking(temporaryPath)
    expect(linking.getSourceGuild().guildId).toBe('src')
    expect(linking.getDestGuilds().length).toBe(1)
  })

  it('ファイルが存在しない場合に例外', () => {
    expect(() => new Linking('notfound.yml')).toThrow(
      'Linking file does not exist'
    )
  })

  it('YAMLが不正な場合に例外', () => {
    fs.writeFileSync(temporaryPath, 'invalid: [')
    expect(() => new Linking(temporaryPath)).toThrow()
  })

  it('バリデーション失敗時に例外（rolesが空配列）', () => {
    const invalid = {
      ...validData,
      sourceGuild: { ...validData.sourceGuild, roles: undefined },
    }
    fs.writeFileSync(temporaryPath, yaml.dump(invalid))
    expect(() => new Linking(temporaryPath)).toThrow()
  })

  it('rolesやdestGuildsが空配列の場合もバリデーション成功', () => {
    const data = {
      ...validData,
      sourceGuild: { ...validData.sourceGuild, roles: [] },
      destGuilds: [],
    }
    fs.writeFileSync(temporaryPath, yaml.dump(data))
    const linking = new Linking(temporaryPath)
    expect(Array.isArray(linking.getSourceGuild().roles)).toBe(true)
    expect(Array.isArray(linking.getDestGuilds())).toBe(true)
  })
})
