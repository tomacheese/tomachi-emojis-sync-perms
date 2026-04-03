import { Logger } from '@book000/node-utils'
import { Configuration } from './config'
import { Discord } from './discord'

function main() {
  const logger = Logger.configure('main')
  const config = new Configuration('data/config.json')
  config.load()
  if (!config.validate()) {
    logger.error('❌ Configuration is invalid')
    logger.error(
      `💡 Missing check(s): ${config.getValidateFailures().join(', ')}`
    )
    return
  }

  logger.info('🤖 Starting tomachi-emojis-sync-perms')

  const discord = new Discord(config)
  process.once('SIGINT', () => {
    logger.info('👋 SIGINT signal received.')
    discord
      .close()
      .then(() => {
        logger.info('🤖 Stopped tomachi-emojis-sync-perms')
        process.exit(0)
      })
      .catch((err: unknown) => {
        logger.error('Error', err as Error)
        process.exit(1)
      })
  })

  // uncaughtExceptionの場合にも終了処理を行う
  process.once('uncaughtException', (error) => {
    logger.error('Error', error)
    process.exit(1)
  })
}

main()
