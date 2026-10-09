/* eslint-disable no-console */
const BASE = 'http://localhost:5000/api'
let pass = 0, fail = 0
const check = (n, c, x = '') => { if (c) { pass++; console.log('  ok', n) } else { fail++; console.log('  FAIL:', n, x) } }
const req = async (m, p, b, t) => {
  const r = await fetch(BASE + p, { method: m, headers: { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}) }, body: b ? JSON.stringify(b) : undefined })
  let d = null; try { d = await r.json() } catch {}
  return { status: r.status, data: d }
}

const login = await req('POST', '/auth/login', { email: 'student@learnhub.dev', password: 'password123' })
const tok = login.data.token

const list = await req('GET', '/courses?limit=48')
const my = await req('GET', '/enrollments/my', null, tok)
const owned = new Set(my.data.items.map(e => String(e.course.id)))
const target = list.data.items.find(c => c.price > 0 && !owned.has(String(c.id)))
console.log('Purchasing:', target.title.slice(0, 45), '— $' + target.price)

console.log('\n[validation]')
let r = await req('POST', `/checkout/${target.id}`, { cardName: 'Sam', cardNumber: '4242424242424241', expiry: '12/29', cvc: '123' }, tok)
check('Luhn-invalid card rejected 400', r.status === 400, JSON.stringify(r.data))
r = await req('POST', `/checkout/${target.id}`, { cardName: 'Sam', cardNumber: '4242424242424242', expiry: '13/29', cvc: '123' }, tok)
check('invalid month rejected', r.status === 400)
r = await req('POST', `/checkout/${target.id}`, { cardName: 'Sam', cardNumber: '4242424242424242', expiry: '01/20', cvc: '123' }, tok)
check('expired card rejected', r.status === 400)
r = await req('POST', `/checkout/${target.id}`, { cardName: 'Sam', cardNumber: '4242424242424242', expiry: '12/29', cvc: '12' }, tok)
check('short CVC rejected', r.status === 400)
r = await req('POST', `/checkout/${target.id}`, { cardName: 'Sam', cardNumber: '378282246310005', expiry: '12/29', cvc: '123' }, tok)
check('Amex with 3-digit CVC rejected (needs 4)', r.status === 400)

console.log('\n[decline cards]')
r = await req('POST', `/checkout/${target.id}`, { cardName: 'Sam', cardNumber: '4000000000000002', expiry: '12/29', cvc: '123' }, tok)
check('4000...0002 declined 402: "' + (r.data?.message || '') + '"', r.status === 402)
r = await req('POST', `/checkout/${target.id}`, { cardName: 'Sam', cardNumber: '4000000000009995', expiry: '12/29', cvc: '123' }, tok)
check('4000...9995 insufficient funds 402', r.status === 402)

console.log('\n[success + entitlement]')
r = await req('POST', `/checkout/${target.id}`, { cardName: 'Sam Student', cardNumber: '4242424242424242', expiry: '12/29', cvc: '123' }, tok)
check('4242... succeeds 201', r.status === 201, JSON.stringify(r.data))
check('receipt has brand+last4+ref', r.data?.order?.cardBrand === 'Visa' && r.data?.order?.cardLast4 === '4242' && !!r.data?.order?.providerRef)
r = await req('POST', `/checkout/${target.id}`, { cardName: 'Sam Student', cardNumber: '4242424242424242', expiry: '12/29', cvc: '123' }, tok)
check('duplicate purchase rejected', r.status === 400)
r = await req('GET', `/courses/${target.id}/learn`, null, tok)
check('learn accessible after purchase', r.status === 200)

console.log('\n[free course path]')
const free = list.data.items.find(c => c.price === 0 && !owned.has(String(c.id)))
r = await req('POST', `/courses/${free.id}/enroll`, {}, tok)
check('free enroll works', r.status === 201 || r.status === 200)
r = await req('POST', `/courses/${free.id}/enroll`, {}, tok)
check('free re-enroll idempotent', r.status === 200)

console.log('\n[own-course guard]')
const instr = await req('POST', '/auth/login', { email: 'instructor@learnhub.dev', password: 'password123' })
const ownCourse = list.data.items.find(c => c.instructor?.id === instr.data.user.id)
if (ownCourse) {
  r = await req('POST', `/checkout/${ownCourse.id}`, { cardName: 'Ada', cardNumber: '4242424242424242', expiry: '12/29', cvc: '123' }, instr.data.token)
  check('instructor cannot buy own course', r.status === 400)
}

console.log(`\n=== ${pass} passed, ${fail} failed ===`)
process.exit(fail ? 1 : 0)
