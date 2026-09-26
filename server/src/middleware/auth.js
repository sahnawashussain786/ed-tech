import { User } from '../models/index.js'
import { verifyToken } from '../utils/token.js'
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js'

/**
 * Require a valid Bearer token; attaches req.user (full doc).
 */
export async function protect(req, _res, next) {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) throw new UnauthorizedError('Please log in to continue')

    let payload
    try {
      payload = verifyToken(token)
    } catch {
      throw new UnauthorizedError('Session expired — please log in again')
    }

    const user = await User.findById(payload.sub)
    if (!user) throw new UnauthorizedError('Account no longer exists')

    req.user = user
    next()
  } catch (err) {
    next(err)
  }
}

/**
 * Attach req.user when a token is present, but never reject.
 */
export async function optionalAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (token) {
      const payload = verifyToken(token)
      const user = await User.findById(payload.sub)
      if (user) req.user = user
    }
  } catch {
    // Ignore invalid tokens for public routes
  }
  next()
}

/**
 * Restrict a route to specific roles.
 */
export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(new UnauthorizedError())
    if (!roles.includes(req.user.role)) return next(new ForbiddenError('Insufficient permissions'))
    next()
  }
}
