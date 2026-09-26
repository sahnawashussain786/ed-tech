import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'

import { NotFoundError } from './utils/errors.js'
import { errorHandler } from './middleware/error.js'
import { sanitizeQuery } from './middleware/sanitize.js'

import authRoutes from './routes/auth.routes.js'
import courseRoutes from './routes/course.routes.js'
import lessonRoutes from './routes/lesson.routes.js'
import enrollmentRoutes from './routes/enrollment.routes.js'
import checkoutRoutes from './routes/checkout.routes.js'
import reviewRoutes from './routes/review.routes.js'
import instructorRoutes from './routes/instructor.routes.js'
import userRoutes from './routes/user.routes.js'
import metaRoutes from './routes/meta.routes.js'

/**
 * Create and configure the Express app (also used by the Vercel serverless entry).
 */
export function createApp() {
  const app = express()

  app.set('trust proxy', 1)
  app.disable('x-powered-by')

  const allowedOrigins = [
    process.env.CLIENT_URL,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:4173',
  ].filter(Boolean)

  app.use(
    cors({
      origin(origin, cb) {
        // Allow same-origin/no-origin (curl, serverless, same-domain frontend)
        if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
        return cb(null, true) // same-origin deploys: the browser never sends cross-origin creds here
      },
      credentials: true,
    }),
  )
  app.use(helmet({ crossOriginResourcePolicy: false }))
  app.use(express.json({ limit: '1mb' }))
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'tiny' : 'dev', { skip: () => process.env.VERCEL === '1' }))
  app.use(sanitizeQuery)

  app.get('/api/health', (_req, res) =>
    res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() }),
  )

  app.use('/api/auth', authRoutes)
  app.use('/api/courses', courseRoutes)
  app.use('/api/lessons', lessonRoutes)
  app.use('/api/enrollments', enrollmentRoutes)
  app.use('/api/checkout', checkoutRoutes)
  app.use('/api/reviews', reviewRoutes)
  app.use('/api/instructor', instructorRoutes)
  app.use('/api/users', userRoutes)
  app.use('/api/meta', metaRoutes)

  app.use((_req, _res, next) => next(new NotFoundError('Route not found')))
  app.use(errorHandler)

  return app
}
