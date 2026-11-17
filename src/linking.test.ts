import fs from 'node:fs'
import yaml from 'js-yaml'
import { Linking, ILinking } from './linking'

describe('Linking', () => {
  const validData: ILinking = {
    sourceGuild: { guildId: 'src', roles: [{ type: 'admin', roleId: '1' }] },
    destGuilds: [{ guildId: 'dst', roles: [{ type: 'admin', roleId: '2' }] }],
  }
  const tempPath = 'temp-linking.yml'

  afterEach(() => {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath)
  })

  it('存在するYAMLファイルを読み込んだ場合、正しくパース・バリデーションされる', () => {
    fs.writeFileSync(tempPath, yaml.dump(validData))
    const linking = new Linking(tempPath)
    expect(linking.getSourceGuild().guildId).toBe('src')
    expect(linking.getDestGuilds().length).toBe(1)
  })

  it('ファイルが存在しない場合に例外', () => {
    expect(() => new Linking('notfound.yml')).toThrow(
      'Linking file does not exist'
    )
  })

  it('YAMLが不正な場合に例外', () => {
    fs.writeFileSync(tempPath, 'invalid: [')
    expect(() => new Linking(tempPath)).toThrow()
  })

  it('バリデーション失敗時に例外（rolesが空配列）', () => {
    const invalid = {
      ...validData,
      sourceGuild: { ...validData.sourceGuild, roles: undefined },
    }
    fs.writeFileSync(tempPath, yaml.dump(invalid))
    expect(() => new Linking(tempPath)).toThrow()
  })

  describe('要素のバリデーション', () => {
    const cases: [string, unknown, string][] = [
      [
        'sourceGuild.roles の要素に type が無い',
        { ...validData, sourceGuild: { guildId: 'src', roles: [{}] } },
        'Linking validation failed: sourceGuild.roles[0].type is string',
      ],
      [
        'destGuilds の要素に guildId が無い',
        { ...validData, destGuilds: [{}] },
        'Linking validation failed: destGuilds[0].guildId is string',
      ],
      [
        'destGuilds の要素に roles が無い',
        { ...validData, destGuilds: [{ guildId: 'dst' }] },
        'Linking validation failed: destGuilds[0].roles is array',
      ],
      [
        'destGuilds[].roles の要素に roleId が無い',
        {
          ...validData,
          destGuilds: [{ guildId: 'dst', roles: [{ type: 'admin' }] }],
        },
        'Linking validation failed: destGuilds[0].roles[0].roleId is string',
      ],
      [
        'destGuilds の guildId が文字列でない',
        { ...validData, destGuilds: [{ guildId: 123, roles: [] }] },
        'Linking validation failed: destGuilds[0].guildId is string',
      ],
      [
        'destGuilds の要素が null',
        { ...validData, destGuilds: [null] },
        'Linking validation failed: destGuilds[0] is object',
      ],
    ]

    it.each(cases)('%s場合に例外', (_name, data, message) => {
      fs.writeFileSync(tempPath, yaml.dump(data))
      expect(() => new Linking(tempPath)).toThrow(new Error(message))
    })
  })

  it('rolesやdestGuildsが空配列の場合もバリデーション成功', () => {
    const data = {
      ...validData,
      sourceGuild: { ...validData.sourceGuild, roles: [] },
      destGuilds: [],
    }
    fs.writeFileSync(tempPath, yaml.dump(data))
    const linking = new Linking(tempPath)
    expect(Array.isArray(linking.getSourceGuild().roles)).toBe(true)
    expect(Array.isArray(linking.getDestGuilds())).toBe(true)
  })
})
