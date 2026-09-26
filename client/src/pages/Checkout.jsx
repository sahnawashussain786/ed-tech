import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Spinner from '../components/Spinner.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { useCourse } from '../hooks/useCourses.js'
import { useAuth } from '../context/AuthContext.jsx'
import { api, apiErrorMessage } from '../lib/api.js'
import { formatPrice, formatDuration } from '../lib/format.js'
import { CheckIcon, CreditCardIcon, CalendarIcon, ShieldIcon } from '../components/Icons.jsx'

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setProcessing(true)
    try {
      // Mock gateway on the server only needs cardName — card details are
      // intentionally NOT sent anywhere (demo only, never store card data).
      await api.post(`/checkout/${id}`, { cardName: name })
      navigate(`/learn/${id}`)
    } catch (err) {
      alert(apiErrorMessage(err))
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
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      maxLength={19}
                      className={`block w-full rounded-lg border py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${
                        errors.cardNumber ? 'border-rose-300' : 'border-slate-300'
                      }`}
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>
                  {errors.cardNumber && <p className="mt-1 text-xs text-rose-600">{errors.cardNumber}</p>}
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
                  className="flex w-full items-center justify-center rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {processing ? 'Processing...' : `Pay ${formatPrice(course.price)}`}
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
