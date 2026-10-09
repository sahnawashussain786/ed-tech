import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Spinner from '../components/Spinner.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { useCourse } from '../hooks/useCourses.js'
import { useAuth } from '../context/AuthContext.jsx'
import { api, apiErrorMessage } from '../lib/api.js'
import { formatPrice, formatDuration, formatDate } from '../lib/format.js'
import { PlayIcon } from '../components/Icons.jsx'
import { CheckIcon, CreditCardIcon, CalendarIcon, ShieldIcon, LockIcon } from '../components/Icons.jsx'

// Stripe-style test cards for the mock gateway
const TEST_CARDS = [
  { label: 'Success', number: '4242 4242 4242 4242', hint: 'Visa — payment succeeds', cls: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  { label: 'Declined', number: '4000 0000 0000 0002', hint: 'Visa — card is declined', cls: 'border-rose-200 bg-rose-50 text-rose-700' },
  { label: 'No funds', number: '4000 0000 0000 9995', hint: 'Visa — insufficient funds', cls: 'border-amber-200 bg-amber-50 text-amber-700' },
]

function detectBrandLocal(num) {
  const n = num.replace(/\s/g, '')
  if (/^4/.test(n)) return 'Visa'
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return 'Mastercard'
  if (/^3[47]/.test(n)) return 'Amex'
  return null
}

export default function Checkout() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { course, loading: courseLoading, error: courseError } = useCourse(id)
  const [processing, setProcessing] = useState(false)
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [name, setName] = useState('')
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      setName(user.name || '')
    }
  }, [user])

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  const handleCardNumberChange = (e) => {
    setCardNumber(formatCardNumber(e.target.value))
  }

  const handleExpiryChange = (e) => {
    setExpiry(formatExpiry(e.target.value))
  }

  const validateForm = () => {
    const newErrors = {}
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
      newErrors.cardNumber = 'Please enter a valid card number'
    }
    if (!expiry || expiry.length < 5) {
      newErrors.expiry = 'Please enter a valid expiry date'
    }
    if (!cvv || cvv.length < 3) {
      newErrors.cvv = 'Please enter a valid CVV'
    }
    if (!name.trim()) {
      newErrors.name = 'Please enter your name'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const [receipt, setReceipt] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setProcessing(true)
    setError('')
    try {
      // Mock gateway — never store real card data. Server validates the card
      // with Luhn + expiry + CVC checks and supports decline-simulation cards.
      const res = await api.post(`/checkout/${id}`, {
        cardName: name,
        cardNumber: cardNumber.replace(/\s/g, ''),
        expiry,
        cvc: cvv,
      })
      setReceipt(res.data)
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setProcessing(false)
    }
  }

  if (courseLoading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Spinner />
      </div>
    )
  }

  if (courseError || !course) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState title="Course not found" description="The course you're trying to purchase doesn't exist." />
      </div>
    )
  }  if (course.price === 0) {
    // Free course - enroll directly
    const handleFreeEnroll = async () => {
      setProcessing(true)
      try {
        await api.post(`/courses/${id}/enroll`)
        navigate(`/learn/${id}`)
      } catch (err) {
        alert(apiErrorMessage(err))
      } finally {
        setProcessing(false)
      }
    }

    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900">Enroll in {course.title}</h1>
            <p className="mt-2 text-slate-600">This course is free! Start learning right away.</p>
            <button
              onClick={handleFreeEnroll}
              disabled={processing}
              className="mt-6 rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {processing ? 'Enrolling...' : 'Start Learning'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Receipt screen after successful payment ──
  if (receipt) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-emerald-100 bg-emerald-50 p-8 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100">
                <CheckIcon size={28} className="text-emerald-600" />
              </div>
              <h1 className="mt-4 text-2xl font-bold text-slate-900">Payment successful</h1>
              <p className="mt-1 text-sm text-slate-600">{receipt.message}</p>
            </div>
            <div className="space-y-4 p-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Amount paid</span>
                <span className="text-lg font-bold text-slate-900">{formatPrice(receipt.order.amount)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Payment method</span>
                <span className="font-medium text-slate-900">
                  {receipt.order.cardBrand} •••• {receipt.order.cardLast4}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Reference</span>
                <span className="font-mono text-xs text-slate-900">{receipt.order.providerRef}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Date</span>
                <span className="font-medium text-slate-900">{formatDate(receipt.order.paidAt)}</span>
              </div>
              <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
                This is a simulated payment — no real money moved. The card details are validated
                locally and never stored.
              </p>
              <button
                onClick={() => navigate(`/learn/${id}`)}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                <PlayIcon size={16} /> Start learning
              </button>
              <Link
                to="/dashboard"
                className="block text-center text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                Go to my learning
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to={`/courses/${id}`} className="text-sm text-brand-600 hover:text-brand-700">
            ← Back to course
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-slate-900">Checkout</h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Payment form */}
          <div className="order-2 lg:order-1">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Payment details</h2>
              <p className="mt-1 text-sm text-slate-600">Complete your purchase securely</p>

              {error && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                    Name on card
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`mt-1 block w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${
                      errors.name ? 'border-rose-300' : 'border-slate-300'
                    }`}
                    placeholder="John Doe"
                  />
                  {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="cardNumber" className="block text-sm font-medium text-slate-700">
                    Card number
                  </label>
                  <div className="relative mt-1">
                    <CreditCardIcon size={20} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="cardNumber"
                      type="text"
                      inputMode="numeric"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      maxLength={19}
                      className={`block w-full rounded-lg border py-2.5 pl-10 pr-16 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${
                        errors.cardNumber ? 'border-rose-300' : 'border-slate-300'
                      }`}
                      placeholder="1234 5678 9012 3456"
                    />
                    {detectBrandLocal(cardNumber) && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                        {detectBrandLocal(cardNumber)}
                      </span>
                    )}
                  </div>
                  {errors.cardNumber && <p className="mt-1 text-xs text-rose-600">{errors.cardNumber}</p>}
                </div>

                {/* Test cards — one click fills the form */}
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Test cards (click to fill)</p>
                  <div className="mt-2 grid gap-1.5">
                    {TEST_CARDS.map((tc) => (
                      <button
                        key={tc.number}
                        type="button"
                        onClick={() => {
                          setCardNumber(tc.number)
                          setExpiry('12/29')
                          setCvv('123')
                          if (!name) setName(user?.name || 'Test User')
                          setErrors({})
                        }}
                        className={`flex items-center justify-between rounded-md border px-2.5 py-1.5 text-xs transition hover:shadow-sm ${tc.cls}`}
                      >
                        <span className="font-mono font-semibold">{tc.number}</span>
                        <span>{tc.hint}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="expiry" className="block text-sm font-medium text-slate-700">
                      Expiry date
                    </label>
                    <div className="relative mt-1">
                      <CalendarIcon size={20} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        id="expiry"
                        type="text"
                        value={expiry}
                        onChange={handleExpiryChange}
                        maxLength={5}
                        placeholder="MM/YY"
                        className={`block w-full rounded-lg border py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${
                          errors.expiry ? 'border-rose-300' : 'border-slate-300'
                        }`}
                      />
                    </div>
                    {errors.expiry && <p className="mt-1 text-xs text-rose-600">{errors.expiry}</p>}
                  </div>

                  <div>
                    <label htmlFor="cvv" className="block text-sm font-medium text-slate-700">
                      CVV
                    </label>
                    <input
                      id="cvv"
                      type="text"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, ''))}
                      maxLength={4}
                      className={`mt-1 block w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${
                        errors.cvv ? 'border-rose-300' : 'border-slate-300'
                      }`}
                      placeholder="123"
                    />
                    {errors.cvv && <p className="mt-1 text-xs text-rose-600">{errors.cvv}</p>}
                  </div>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    <ShieldIcon size={20} className="mt-0.5 text-brand-600" />
                    <div className="text-sm text-slate-600">
                      <p className="font-medium text-slate-900">Secure payment</p>
                      <p className="mt-1">Your payment information is encrypted and secure.</p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={processing}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {processing ? (
                    <>
                      <Spinner size={16} className="border-white/40 border-t-white" /> Processing payment...
                    </>
                  ) : (
                    <>
                      <LockIcon size={14} /> Pay {formatPrice(course.price)}
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-slate-500">
                  By clicking "Pay", you agree to our Terms of Service and Privacy Policy.
                </p>
              </form>
            </div>
          </div>

          {/* Order summary */}
          <div className="order-1 lg:order-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Order summary</h2>

              <div className="mt-4 flex gap-4">
                <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                  {course.thumbnailUrl ? (
                    <img src={course.thumbnailUrl} alt={course.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-gradient-to-br from-brand-500 to-brand-700 text-white">
                      <span className="text-2xl">📚</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-slate-900 line-clamp-2">{course.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{course.instructor?.name || 'Instructor'}</p>
                </div>
              </div>

              <div className="mt-6 space-y-3 border-t border-slate-200 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Original price</span>
                  <span className="text-slate-900">{formatPrice(course.price)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Discount</span>
                  <span className="text-emerald-600">-$0.00</span>
                </div>
                <div className="flex justify-between text-base font-semibold">
                  <span className="text-slate-900">Total</span>
                  <span className="text-slate-900">{formatPrice(course.price)}</span>
                </div>
              </div>

              <div className="mt-6 space-y-2 rounded-lg bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckIcon size={16} className="text-brand-600" />
                  <span>Lifetime access</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckIcon size={16} className="text-brand-600" />
                  <span>{formatDuration(course.totalMinutes || 0)} of content</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckIcon size={16} className="text-brand-600" />
                  <span>Certificate of completion</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckIcon size={16} className="text-brand-600" />
                  <span>30-day money-back guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
