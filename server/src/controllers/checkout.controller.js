import { Course, Order } from '../models/index.js'
import { BadRequestError, NotFoundError, PaymentError } from '../utils/errors.js'
import { enrollStudent, incrementCourseStudents } from './enrollment.controller.js'

/**
 * Mock card gateway — modelled on Stripe's test-card conventions.
 * Stripe test card numbers (https://docs.stripe.com/testing):
 *   4242424242424242  Visa — succeeds
 *   5555555555554444  Mastercard — succeeds
 *   378282246310005   Amex — succeeds
 *   4000000000000002  Visa — always declined
 *   4000000000009995  Visa — declined (insufficient funds)
 */
export const TEST_CARDS = {
  '4242424242424242': { brand: 'Visa', outcome: 'succeed' },
  '4242424242424241': { brand: 'Visa', outcome: 'succeed' }, // off-by-one Luhn — rejected earlier
  '5555555555554444': { brand: 'Mastercard', outcome: 'succeed' },
  '378282246310005': { brand: 'Amex', outcome: 'succeed' },
  '4000000000000002': { brand: 'Visa', outcome: 'declined', reason: 'Your card was declined.' },
  '4000000000009995': { brand: 'Visa', outcome: 'declined', reason: 'Your card has insufficient funds.' },
  '4000000000000069': { brand: 'Visa', outcome: 'declined', reason: 'Your card was expired.' },
  '4000000000000127': { brand: 'Visa', outcome: 'declined', reason: 'Your card’s security code is incorrect.' },
}

/** Luhn checksum — same algorithm real gateways run before authorizing. */
export function luhnValid(cardNumber) {
  const digits = String(cardNumber).replace(/\D/g, '')
  if (digits.length < 13 || digits.length > 19) return false
  let sum = 0
  let double = false
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i])
    if (double) {
      d *= 2
      if (d > 9) d -= 9
    }
    sum += d
    double = !double
  }
  return sum % 10 === 0
}

/** Detect brand for display purposes. */
export function detectBrand(cardNumber) {
  const n = String(cardNumber).replace(/\D/g, '')
  if (/^4/.test(n)) return 'Visa'
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return 'Mastercard'
  if (/^3[47]/.test(n)) return 'Amex'
  if (/^6(?:011|5)/.test(n)) return 'Discover'
  return 'Card'
}

function parseExpiry(expiry) {
  const m = String(expiry || '').match(/^(\d{2})\s*\/\s*(\d{2,4})$/)
  if (!m) return null
  const month = Number(m[1])
  let year = Number(m[2])
  if (year < 100) year += 2000
  if (month < 1 || month > 12) return null
  return { month, year }
}

/**
 * POST /api/checkout/:courseId  { cardName, cardNumber, expiry, cvc }
 * Simulated payment gateway: validates the card locally (Luhn + expiry + CVC),
 * honors decline-simulation test cards, records a paid Order, creates the
 * Enrollment and increments the course's student count.
 *
 * Swap for Stripe PaymentIntents later — the client contract stays the same.
 */
export async function mockCheckout(req, res, next) {
  try {
    const { cardName, cardNumber, expiry, cvc } = req.body || {}

    if (!cardName || !String(cardName).trim()) throw new BadRequestError('Cardholder name is required')
    if (!cardName || String(cardName).trim().length > 120) throw new BadRequestError('Cardholder name is too long')

    const digits = String(cardNumber || '').replace(/\D/g, '')
    if (!digits) throw new BadRequestError('Card number is required')
    if (!luhnValid(digits)) {
      throw new BadRequestError('Your card number is invalid — check the digits and try again')
    }

    const exp = parseExpiry(expiry)
    if (!exp) throw new BadRequestError('Expiry date must be in MM/YY format')
    const now = new Date()
    const expiryDate = new Date(exp.year, exp.month, 1) // first day after expiry month
    if (expiryDate <= now) throw new BadRequestError('Your card was expired')

    const cvcDigits = String(cvc || '').replace(/\D/g, '')
    const brand = detectBrand(digits)
    const cvcLength = brand === 'Amex' ? 4 : 3
    if (cvcDigits.length !== cvcLength) {
      throw new BadRequestError(`Security code must be ${cvcLength} digits for ${brand}`)
    }

    const course = await Course.findById(req.params.courseId)
    if (!course || course.status !== 'published') throw new NotFoundError('Course not found')
    if (String(course.instructor) === String(req.user._id)) {
      throw new BadRequestError('You cannot purchase your own course')
    }

    const alreadyOrdered = await Order.findOne({
      student: req.user._id,
      course: course._id,
      status: 'paid',
    })
    if (alreadyOrdered) throw new BadRequestError('You already own this course')

    // Simulated gateway latency + decline-simulation test cards
    await new Promise((resolve) => setTimeout(resolve, 700))
    const testCard = TEST_CARDS[digits]
    if (testCard?.outcome === 'declined') {
      throw new PaymentError(testCard.reason)
    }

    const order = await Order.create({
      student: req.user._id,
      course: course._id,
      amount: course.price,
      status: 'paid',
      provider: 'mock',
      providerRef: `mock_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`,
      paidAt: new Date(),
    })

    const enrollment = await enrollStudent(req.user._id, course._id)
    await incrementCourseStudents(course._id)

    res.status(201).json({
      order: {
        id: order.id,
        amount: order.amount,
        cardBrand: brand,
        cardLast4: digits.slice(-4),
        providerRef: order.providerRef,
        paidAt: order.paidAt,
      },
      enrollmentId: enrollment.id,
      courseId: course._id,
      message: `Payment simulated — you now own “${course.title}”`,
    })
  } catch (err) {
    next(err)
  }
}
