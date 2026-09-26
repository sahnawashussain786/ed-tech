import { Link } from 'react-router-dom'
import { SearchIcon } from './Icons.jsx'

export default function EmptyState({ icon, title, message, description, actionLabel, actionTo, onAction }) {
  const body = description || message

  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
        {icon || <SearchIcon size={26} />}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
      {body && <p className="mt-1 max-w-sm text-sm text-slate-500">{body}</p>}
      {actionLabel && (onAction || actionTo) && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          {actionLabel}
        </button>
      ) : actionLabel && actionTo ? (
        <Link
          to={actionTo}
          className="mt-5 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  )
}
