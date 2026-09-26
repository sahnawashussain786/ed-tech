import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { apiErrorMessage } from '../lib/api.js'
import { LockIcon, MailIcon, SparkIcon, UsersIcon } from '../components/Icons.jsx'

// These must match the seed script (server/src/scripts/seed.js)
const DEMO_ACCOUNTS = [
  {
    role: 'Student',
    name: 'Sam Student',
    email: 'student@learnhub.dev',
    password: 'password123',
    description: 'Enrolled in 2 courses, has purchase history',
    accent: 'bg-emerald-100 text-emerald-700',
  },
  {
    role: 'Instructor',
    name: 'Ada Lovelace',
    email: 'instructor@learnhub.dev',
    password: 'password123',
    description: 'Owns 3 courses including a web dev bootcamp',
    accent: 'bg-brand-100 text-brand-700',
  },
  {
    role: 'Instructor',
    name: 'Grace Hopper',
    email: 'grace@learnhub.dev',
    password: 'password123',
    description: 'Owns 3 courses — data science & marketing',
    accent: 'bg-brand-100 text-brand-700',
  },
]

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login } = useAuth()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const redirect = searchParams.get('redirect') || '/'
  const [demoLoading, setDemoLoading] = useState('')

  const handleDemoLogin = async (account) => {
    if (demoLoading) return
    setDemoLoading(account.email)
    setError('')
    try {
      await login(account.email, account.password)
      navigate(account.role === 'Instructor' ? '/studio' : '/dashboard', { replace: true })
    } catch (err) {
      setError(
        `${apiErrorMessage(err)} — if this is a fresh database, run the seed script first: cd server && npm run seed`,
      )
    } finally {
      setDemoLoading('')
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError('')

    try {
      await login(formData.email, formData.password)
      navigate(redirect, { replace: true })
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center">
          <Link to="/" className="mx-auto flex w-fit items-center justify-center gap-2">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-600 text-white shadow-sm">
              <SparkIcon size={24} />
            </span>
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              Learn<span className="text-brand-600">Hub</span>
            </span>
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-slate-900">Sign in to your account</h2>
          <p className="mt-2 text-sm text-slate-600">
            Or{' '}
            <Link to="/register" className="font-medium text-brand-600 hover:text-brand-500">
              create a new account
            </Link>
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {/* Demo accounts — one-click sign-in */}
          <div className="mb-6 rounded-xl border border-dashed border-brand-200 bg-brand-50/60 p-4">
            <div className="flex items-center gap-2">
              <UsersIcon size={16} className="text-brand-600" />
              <h3 className="text-sm font-semibold text-slate-900">Demo accounts</h3>
              <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-500">
                click to sign in
              </span>
            </div>
            <div className="mt-3 space-y-2">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => handleDemoLogin(account)}
                  disabled={demoLoading}
                  className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left transition hover:border-brand-300 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${account.accent}`}
                  >
                    {demoLoading === account.email ? '…' : account.role}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-900">
                      {account.email}
                    </span>
                    <span className="block truncate text-xs text-slate-500">{account.description}</span>
                  </span>
                  <span className="shrink-0 font-mono text-xs text-slate-400">{account.password}</span>
                </button>
              ))}
            </div>
          </div>

          {searchParams.get('expired') === '1' && (
            <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
              Your session has expired. Please sign in again.
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-sm text-rose-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email address
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <MailIcon size={18} className="text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <LockIcon size={18} className="text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-slate-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-brand-600 hover:text-brand-500">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-slate-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </button>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-brand-600 hover:text-brand-500">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
