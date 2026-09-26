import { Link } from 'react-router-dom'
import CourseCard from '../components/CourseCard.jsx'
import Spinner from '../components/Spinner.jsx'
import { useCourses } from '../hooks/useCourses.js'
import { SearchIcon, SparkIcon, UsersIcon, TrophyIcon, GlobeIcon } from '../components/Icons.jsx'

const CATEGORIES = [
  { name: 'Development', icon: '💻', grad: 'from-indigo-500 to-blue-600' },
  { name: 'Business', icon: '📈', grad: 'from-emerald-500 to-teal-600' },
  { name: 'Design', icon: '🎨', grad: 'from-pink-500 to-rose-600' },
  { name: 'Marketing', icon: '📣', grad: 'from-amber-500 to-orange-600' },
  { name: 'Data Science', icon: '📊', grad: 'from-violet-500 to-purple-600' },
  { name: 'Photography', icon: '📷', grad: 'from-cyan-500 to-sky-600' },
  { name: 'Music', icon: '🎵', grad: 'from-fuchsia-500 to-pink-600' },
  { name: 'Personal Development', icon: '🌱', grad: 'from-lime-500 to-green-600' },
]

export default function Home() {
  const { items: popular, loading } = useCourses({ sort: 'popular', limit: 8 })
  const { items: newest } = useCourses({ sort: 'newest', limit: 4 })

  return (
    <div>
      {/* Hero */}
      <section className="bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-brand-200">
              <SparkIcon size={14} /> New courses added weekly
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Learn anything.
              <br />
              <span className="bg-gradient-to-r from-brand-300 to-accent-400 bg-clip-text text-transparent">
                Anytime, anywhere.
              </span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-slate-300">
              Join thousands of students learning development, design, data, and business from instructors
              who actually ship.
            </p>
            <form
              action="/courses"
              className="mt-8 flex max-w-md overflow-hidden rounded-full border border-white/20 bg-white/10 p-1 backdrop-blur"
            >
              <input
                name="search"
                type="search"
                placeholder="What do you want to learn?"
                className="w-full bg-transparent px-4 text-sm text-white placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold transition hover:bg-brand-500"
              >
                <SearchIcon size={16} /> Search
              </button>
            </form>
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-slate-400">
              <span className="inline-flex items-center gap-2"><UsersIcon size={16} /> 40k+ students</span>
              <span className="inline-flex items-center gap-2"><TrophyIcon size={16} /> 100+ courses</span>
              <span className="inline-flex items-center gap-2"><GlobeIcon size={16} /> 12 categories</span>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-tr from-brand-600/30 to-accent-500/20 blur-2xl" />
            <div className="relative grid grid-cols-2 gap-4">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur ${
                    i % 2 ? 'translate-y-6' : ''
                  }`}
                >
                  <div className="aspect-video bg-gradient-to-br from-brand-800 to-slate-800" />
                  <div className="space-y-2 p-4">
                    <div className="h-2.5 w-3/4 rounded bg-white/20" />
                    <div className="h-2.5 w-1/2 rounded bg-white/10" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-slate-900">Browse top categories</h2>
        <p className="mt-1 text-sm text-slate-500">Find the right track for your goals</p>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.name}
              to={`/courses?category=${encodeURIComponent(c.name)}`}
              className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
            >
              <span className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${c.grad} text-xl`}>
                {c.icon}
              </span>
              <p className="mt-3 text-sm font-semibold text-slate-900 group-hover:text-brand-700">{c.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular courses */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Most popular</h2>
              <p className="mt-1 text-sm text-slate-500">Loved by thousands of students</p>
            </div>
            <Link to="/courses" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
              See all →
            </Link>
          </div>
          {loading ? (
            <div className="mt-8 grid place-items-center py-16"><Spinner /></div>
          ) : (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {popular.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* New courses */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">New releases</h2>
            <p className="mt-1 text-sm text-slate-500">Fresh from our instructors</p>
          </div>
          <Link to="/courses?sort=newest" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
            See all →
          </Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {newest.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="max-w-2xl text-3xl font-bold text-slate-900">
            Ready to share what you know?
          </h2>
          <p className="max-w-xl text-slate-500">
            Create an instructor account, upload your first course in minutes, and reach students worldwide.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/register"
              className="rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-brand-700"
            >
              Become an instructor
            </Link>
            <Link
              to="/courses"
              className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Browse courses
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
