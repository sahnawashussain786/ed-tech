import 'dotenv/config'
import { createApp } from './app.js'
import { connectDB } from './config/db.js'
import { config } from './config/env.js'
import { logger } from './utils/logger.js'

const PORT = config.port

async function main() {
  try {
    await connectDB()
    logger.info('MongoDB connected')
  } catch (err) {
    logger.error(`MongoDB connection failed: ${err.message}`)
    process.exit(1)
  }

  const app = createApp()
  app.listen(PORT, () => {
    logger.info(`API ready at http://localhost:${PORT}`)
  })
}

main()
