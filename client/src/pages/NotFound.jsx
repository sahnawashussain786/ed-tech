import { Link, useNavigate } from 'react-router-dom'
import { HomeIcon, SearchIcon } from '../components/Icons.jsx'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-extrabold text-brand-600">404</h1>
          <h2 className="mt-4 text-2xl font-bold text-slate-900">Page not found</h2>
          <p className="mt-2 text-slate-600">
            Sorry, we couldn't find the page you're looking for.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            <HomeIcon size={20} /> Go home
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Go back
          </button>
        </div>

        <div className="mt-12">
          <p className="text-sm text-slate-500">Or try searching for something:</p>
          <form
            action="/courses"
            className="relative mt-3 mx-auto flex max-w-md overflow-hidden rounded-full border border-slate-300 bg-white"
          >
            <SearchIcon size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              name="search"
              type="search"
              placeholder="Search courses..."
              className="w-full bg-transparent px-4 py-2.5 pl-10 text-sm outline-none"
            />
            <button
              type="submit"
              className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Search
            </button>
          </form>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Link
            to="/courses"
            className="rounded-lg border border-slate-200 bg-white p-4 text-center transition hover:border-brand-300 hover:shadow-md"
          >
            <span className="text-2xl">📚</span>
            <p className="mt-2 text-sm font-medium text-slate-900">Browse courses</p>
          </Link>
          <Link
            to="/login"
            className="rounded-lg border border-slate-200 bg-white p-4 text-center transition hover:border-brand-300 hover:shadow-md"
          >
            <span className="text-2xl">🔐</span>
            <p className="mt-2 text-sm font-medium text-slate-900">Sign in</p>
          </Link>
          <Link
            to="/register"
            className="rounded-lg border border-slate-200 bg-white p-4 text-center transition hover:border-brand-300 hover:shadow-md"
          >
            <span className="text-2xl">✨</span>
            <p className="mt-2 text-sm font-medium text-slate-900">Create account</p>
          </Link>
          <Link
            to="/"
            className="rounded-lg border border-slate-200 bg-white p-4 text-center transition hover:border-brand-300 hover:shadow-md"
          >
            <span className="text-2xl">🏠</span>
            <p className="mt-2 text-sm font-medium text-slate-900">Home</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
