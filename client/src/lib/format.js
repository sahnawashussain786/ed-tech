export function formatPrice(value) {
  const n = Number(value) || 0
  return n === 0 ? 'Free' : `$${n.toFixed(2)}`
}

export function formatDuration(minutes) {
  const m = Number(minutes) || 0
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  const rest = m % 60
  return rest ? `${h}h ${rest}m` : `${h}h`
}

export function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function initials(name) {
  return (name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

export function pluralize(count, singular, plural) {
  return `${count} ${count === 1 ? singular : plural || `${singular}s`}`
}

export function truncate(text, n = 120) {
  if (!text || text.length <= n) return text || ''
  return `${text.slice(0, n).trimEnd()}…`
}
