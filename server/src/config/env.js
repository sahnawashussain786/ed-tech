import dotenv from 'dotenv'

dotenv.config({ path: new URL('../../.env', import.meta.url) })
dotenv.config({ path: new URL('../../.env.local', import.meta.url) })
dotenv.config()

function num(value, fallback) {
  const n = Number(value)
  return Number.isFinite(n) && value !== undefined && value !== '' ? n : fallback
}

export const config = {
  port: num(process.env.PORT, 5000),
  env: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
}
