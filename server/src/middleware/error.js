import { ApiError } from '../utils/errors.js'
import { logger } from '../utils/logger.js'

export function errorHandler(err, _req, res, _next) {
  let statusCode = err.statusCode || 500
  let message = err.message || 'Internal server error'

  // Mongoose: invalid ObjectId
  if (err.name === 'CastError') {
    statusCode = 404
    message = 'Resource not found'
  }
  // Mongoose: duplicate key
  if (err.code === 11000) {
    statusCode = 409
    const field = Object.keys(err.keyPattern || {})[0] || 'field'
    message = `That ${field} is already in use`
  }
  // Mongoose: validation
  if (err.name === 'ValidationError') {
    statusCode = 400
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join('. ')
  }
  // JWT
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401
    message = 'Invalid token'
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Session expired — please log in again'
  }

  if (statusCode >= 500) logger.error(err.stack || err)

  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV !== 'production' && statusCode >= 500 ? { stack: err.stack } : {}),
  })
}
