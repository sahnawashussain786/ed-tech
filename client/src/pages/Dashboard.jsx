import { Link, useNavigate } from 'react-router-dom'
import Spinner from '../components/Spinner.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../lib/api.js'
import { useEffect, useState } from 'react'
import { formatPrice, formatDuration } from '../lib/format.js'
import { PlayIcon, BookIcon, ClockIcon, TrophyIcon, ChartIcon, CheckIcon } from '../components/Icons.jsx'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [enrollments, setEnrollments] = useState([])
  const [stats, setStats] = useState({ totalCourses: 0, completedLessons: 0, totalMinutes: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await api.get('/enrollments/my')
        const items = res.data.items || []
        setEnrollments(items)
        setStats({
          totalCourses: items.length,
          completedLessons: items.reduce((n, e) => n + (e.completedLessons?.length || 0), 0),
          totalMinutes: items.reduce((n, e) => n + (e.course?.totalMinutes || 0), 0),
        })
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-8 text-center">
          <p className="text-rose-800">Failed to load your learning data. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-slate-900">My learning</h1>
          <p className="mt-2 text-slate-600">Welcome back, {user?.name || 'Student'}!</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-100 text-brand-600">
                <BookIcon size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.totalCourses}</p>
                <p className="text-sm text-slate-500">Enrolled courses</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-100 text-emerald-600">
                <CheckIcon size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.completedLessons}</p>
                <p className="text-sm text-slate-500">Completed lessons</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-amber-100 text-amber-600">
                <ClockIcon size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{formatDuration(stats.totalMinutes)}</p>
                <p className="text-sm text-slate-500">Time learned</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-purple-100 text-purple-600">
                <TrophyIcon size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">0</p>
                <p className="text-sm text-slate-500">Certificates</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enrolled courses */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">My courses</h2>
            <Link to="/courses" className="text-sm font-medium text-brand-600 hover:text-brand-700">
              Browse more courses →
            </Link>
          </div>

          {enrollments.length === 0 ? (
            <EmptyState
              title="No courses yet"
              description="Start your learning journey by enrolling in a course"
              actionLabel="Browse courses"
              onAction={() => navigate('/courses')}
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {enrollments.map((enrollment) => {
                const course = enrollment.course
                const progress = enrollment.progressPercent || 0
                const completedLessons = enrollment.completedLessons || []
                const totalLessons = course?.totalLessons || 0

                return (
                  <div
                    key={enrollment.id}
                    className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                  >
                    <div className="relative aspect-video overflow-hidden bg-slate-100">
                      {course?.thumbnailUrl ? (
                        <img
                          src={course.thumbnailUrl}
                          alt={course.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center bg-gradient-to-br from-brand-500 to-brand-700 text-white">
                          <BookIcon size={40} />
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition hover:opacity-100">
                        <Link
                          to={`/learn/${course.id}`}
                          className="flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-slate-900 shadow-lg transition hover:bg-white/90"
                        >
                          <PlayIcon size={20} /> Continue
                        </Link>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="font-semibold text-slate-900 line-clamp-2">{course?.title}</h3>
                      <p className="mt-1 text-sm text-slate-500">{course?.instructor?.name || 'Instructor'}</p>

                      {/* Progress bar */}
                      <div className="mt-4">
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-700">Progress</span>
                          <span className="text-slate-500">{progress.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full bg-brand-600 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          {completedLessons.length} of {totalLessons} lessons completed
                        </p>
                      </div>

                      <div className="mt-auto pt-4">
                        <Link
                          to={`/learn/${course.id}`}
                          className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
                        >
                          <PlayIcon size={16} /> Continue learning
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Learning activity */}
        {enrollments.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-6 text-xl font-bold text-slate-900">Learning activity</h2>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-slate-100">
                  <ChartIcon size={32} className="text-slate-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-600">Your learning statistics</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    Keep up the great work! You've been making good progress.
                  </p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-7 gap-2">
                {Array.from({ length: 7 }).map((_, i) => {
                  const height = Math.random() * 60 + 20
                  return (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div
                        className="w-full rounded-t bg-brand-200"
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-xs text-slate-500">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
