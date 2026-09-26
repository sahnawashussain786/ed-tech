const stamp = () => new Date().toISOString()

export const logger = {
  info: (...args) => console.log(`[${stamp()}] ℹ`, ...args),
  warn: (...args) => console.warn(`[${stamp()}] ⚠`, ...args),
  error: (...args) => console.error(`[${stamp()}] ✖`, ...args),
}
