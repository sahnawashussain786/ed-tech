import { createApp } from '../server/src/app.js'
import { connectDB } from '../server/src/config/db.js'

/**
 * Vercel serverless entry: reuses the Express app and caches the DB connection.
 * Local dev uses server/src/server.js instead.
 *
 * NOTE: api/ has no package.json on purpose — the import walks up to the root
 * node_modules (express) and into server/src relative to this file.
 */
let appPromise = null

async function getApp() {
  if (!appPromise) {
    appPromise = connectDB()
      .then(() => createApp())
      .catch((err) => {
        appPromise = null
        throw err
      })
  }
  return appPromise
}

export default async function handler(req, res) {
  try {
    const app = await getApp()
    return app(req, res)
  } catch (err) {
    console.error('API failed to initialise:', err)
    return res.status(500).json({ message: 'API unavailable — check server logs / MONGODB_URI' })
  }
}
