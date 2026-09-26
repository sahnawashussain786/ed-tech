import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { SearchIcon, MenuIcon, XIcon, GradIcon, LogoutIcon, UserIcon } from './Icons.jsx'
import { initials } from '../lib/format.js'

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white shadow-sm">
        <GradIcon size={20} />
      </span>
      <span className="text-lg font-bold tracking-tight text-slate-900">
        Learn<span className="text-brand-600">Hub</span>
      </span>
    </Link>
  )
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)

  function submitSearch(e) {
    e.preventDefault()
    navigate(`/courses?search=${encodeURIComponent(q.trim())}`)
    setOpen(false)
  }

  function handleLogout() {
    logout()
    setOpen(false)
    navigate('/')
  }

  const navLinkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive ? 'text-brand-700 bg-brand-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <div className="hidden items-center gap-1 lg:flex">
          <NavLink to="/courses" className={navLinkClass}>
            Browse
          </NavLink>
          {user?.role === 'instructor' && (
            <NavLink to="/studio" className={navLinkClass}>
              Studio
            </NavLink>
          )}
        </div>

        <form onSubmit={submitSearch} className="ml-auto hidden max-w-sm flex-1 md:block">
          <label className="relative block">
            <span className="sr-only">Search courses</span>
            <SearchIcon size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              type="search"
              placeholder="Search courses…"
              className="w-full rounded-full border border-slate-300 bg-slate-50 py-2 pl-9 pr-4 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
            />
          </label>
          <button type="submit" className="sr-only">Search</button>
        </form>

        <div className="ml-auto hidden items-center gap-2 md:flex lg:ml-0">
          {user ? (
            <>
              {user.role === 'student' && (
                <Link
                  to="/dashboard"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  My learning
                </Link>
              )}
              <div className="group relative">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full border border-slate-200 py-1.5 pl-1.5 pr-3 transition hover:shadow-sm"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                    {initials(user.name)}
                  </span>
                  <span className="max-w-[120px] truncate text-sm font-medium text-slate-700">{user.name}</span>
                </button>
                <div className="invisible absolute right-0 top-full pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100">
                  <div className="w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                    <div className="border-b border-slate-100 px-4 py-3">
                      <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
                      <p className="truncate text-xs text-slate-500">{user.email}</p>
                    </div>
                    <div className="p-1.5">
                      {user.role === 'instructor' ? (
                        <Link to="/studio" className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                          Instructor studio
                        </Link>
                      ) : (
                        <Link to="/dashboard" className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                          My learning
                        </Link>
                      )}
                      <Link to="/profile" className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        Profile settings
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
                      >
                        <LogoutIcon size={16} /> Log out
                      </button>
                    </div>
                    <div className="border-t border-slate-100 bg-slate-50 px-4 py-2">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        {user.role}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="ml-auto rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <XIcon /> : <MenuIcon />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 pb-4 pt-2 md:hidden">
          <form onSubmit={submitSearch} className="mb-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              type="search"
              placeholder="Search courses…"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </form>
          <div className="space-y-1">
            <Link to="/courses" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Browse courses
            </Link>
            {user?.role === 'instructor' && (
              <Link to="/studio" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Instructor studio
              </Link>
            )}
            {user ? (
              <>
                <Link to="/profile" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Profile settings
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
                >
                  <LogoutIcon size={16} /> Log out
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link to="/login" onClick={() => setOpen(false)} className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-center text-sm font-medium text-slate-700">
                  Log in
                </Link>
                <Link to="/register" onClick={() => setOpen(false)} className="flex-1 rounded-lg bg-brand-600 px-4 py-2 text-center text-sm font-semibold text-white">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
