import z from 'zod'
import fs from 'fs'
import path from 'path'
import 'dotenv/config'
//check exists file env

if (!fs.existsSync(path.resolve('.env'))) {
  console.log('Không tìm thấy file .env')
  process.exit(1)
}
const ConfigSchema = z.object({
  DATABASE_URL: z.string(),
  ACCESS_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_EXPIRES_IN: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_EXPIRES_IN: z.string(),
  API_KEY_SECRET: z.string(),
  ADMIN_NAME: z.string(),
  ADMIN_PASSWORD: z.string(),
  ADMIN_EMAIL: z.string(),
  ADMIN_PHONE_NUMBER: z.string(),
})

const configServer = ConfigSchema.safeParse(process.env)
if (!configServer.success) {
  console.log('Các giá trị env không hợp lệ')
  console.error(configServer.error)
  process.exit(1)
}
const envConfig = configServer.data
export default envConfig
