import { Link } from 'react-router-dom'
import { GradIcon } from './Icons.jsx'

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">
                <GradIcon size={18} />
              </span>
              <span className="font-bold text-slate-900">
                Learn<span className="text-brand-600">Hub</span>
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-500">
              Learn anything, anywhere. Quality courses from instructors who ship.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Learn</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/courses" className="text-slate-500 hover:text-slate-900">Browse courses</Link></li>
              <li><Link to="/register" className="text-slate-500 hover:text-slate-900">Become a student</Link></li>
              <li><Link to="/register" className="text-slate-500 hover:text-slate-900">Become an instructor</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Categories</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/courses?category=Development" className="text-slate-500 hover:text-slate-900">Development</Link></li>
              <li><Link to="/courses?category=Data%20Science" className="text-slate-500 hover:text-slate-900">Data Science</Link></li>
              <li><Link to="/courses?category=Design" className="text-slate-500 hover:text-slate-900">Design</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Account</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/dashboard" className="text-slate-500 hover:text-slate-900">My learning</Link></li>
              <li><Link to="/studio" className="text-slate-500 hover:text-slate-900">Instructor studio</Link></li>
              <li><Link to="/profile" className="text-slate-500 hover:text-slate-900">Profile settings</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} LearnHub. A demo MERN project — payments are simulated.
        </div>
      </div>
    </footer>
  )
}
