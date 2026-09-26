import { Link } from 'react-router-dom'
import { StarIcon, UsersIcon, ClockIcon, BookIcon } from './Icons.jsx'
import { formatPrice, formatDuration } from '../lib/format.js'

function Stars({ rating, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon key={n} size={14} filled={n <= Math.round(rating)} className={n <= Math.round(rating) ? 'text-accent-500' : 'text-slate-300'} />
      ))}
    </span>
  )
}

export default function CourseCard({ course }) {
  const rating = course.avgRating || 0
  return (
    <Link
      to={`/courses/${course.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative aspect-video overflow-hidden bg-slate-100">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-gradient-to-br from-brand-500 to-brand-700 text-white">
            <BookIcon size={40} />
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
          {course.category}
        </span>
        {course.status === 'draft' && (
          <span className="absolute right-3 top-3 rounded-full bg-amber-500 px-2.5 py-1 text-xs font-semibold text-white">
            Draft
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-slate-900 group-hover:text-brand-700">
          {course.title}
        </h3>
        {course.subtitle && <p className="line-clamp-2 text-xs text-slate-500">{course.subtitle}</p>}

        <p className="text-xs text-slate-500">{course.instructor?.name || 'Unknown instructor'}</p>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-bold text-amber-600">{rating.toFixed(1)}</span>
          <Stars rating={rating} />
          <span className="text-slate-400">({course.numReviews || 0})</span>
        </div>

        <div className="mt-auto flex items-center gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <BookIcon size={13} /> {course.totalLessons || 0} lessons
          </span>
          <span className="inline-flex items-center gap-1">
            <ClockIcon size={13} /> {formatDuration(course.totalMinutes || 0)}
          </span>
          <span className="inline-flex items-center gap-1">
            <UsersIcon size={13} /> {course.numStudents || 0}
          </span>
        </div>

        <div className="mt-1 flex items-center justify-between">
          <span className="text-lg font-extrabold text-slate-900">{formatPrice(course.price)}</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            {course.level}
          </span>
        </div>
      </div>
    </Link>
  )
}
