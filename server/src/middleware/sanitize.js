/**
 * Strip MongoDB operators ($, dotted keys) from user-supplied JSON to prevent
 * NoSQL injection. Runs on body and query for every request.
 */
export function sanitizeValue(value) {
  if (Array.isArray(value)) return value.map(sanitizeValue)
  if (value && typeof value === 'object') {
    const clean = {}
    for (const [key, val] of Object.entries(value)) {
      if (key.startsWith('$') || key.includes('.')) continue
      clean[key] = sanitizeValue(val)
    }
    return clean
  }
  return value
}

/**
 * Express 5 defines `req.query` as a getter-only property and ES modules run
 * in strict mode — assigning `req.query = …` throws a TypeError, which made
 * every request 500. Sanitize objects in place instead of replacing them.
 */
function sanitizeInPlace(obj) {
  if (!obj || typeof obj !== 'object') return obj
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key]
      continue
    }
    if (obj[key] && typeof obj[key] === 'object') sanitizeInPlace(obj[key])
  }
  return obj
}

export function sanitizeQuery(req, _res, next) {
  if (req.body && typeof req.body === 'object') sanitizeInPlace(req.body)
  if (req.query && typeof req.query === 'object') sanitizeInPlace(req.query)
  next()
}
