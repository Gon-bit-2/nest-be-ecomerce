import Client from 'ioredis'
import envConfig from './config'
import Redlock from 'redlock'

const redis = new Client({
  host: envConfig.REDIS_HOST,
  port: Number(envConfig.REDIS_PORT),
  password: envConfig.REDIS_PASSWORD,
})

const redlock = new Redlock([redis], {
  retryCount: 3,
  retryDelay: 200,
})

export { redis, redlock }
