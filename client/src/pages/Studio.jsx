import { Link, useNavigate } from 'react-router-dom'
import Spinner from '../components/Spinner.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../lib/api.js'
import { useEffect, useState } from 'react'
import { formatPrice, pluralize } from '../lib/format.js'
import { PlusIcon, EditIcon, TrashIcon, ChartIcon, UsersIcon, DollarIcon, BookIcon } from '../components/Icons.jsx'

export default function Studio() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [stats, setStats] = useState({ totalCourses: 0, totalStudents: 0, totalRevenue: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [coursesRes, statsRes] = await Promise.all([
          api.get('/instructor/courses'),
          api.get('/instructor/overview'),
        ])
        setCourses(coursesRes.data.items || [])
        const s = statsRes.data.stats || {}
        setStats({
          totalCourses: s.courses || 0,
          totalStudents: s.students || 0,
          totalRevenue: s.revenue || 0,
        })
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleDelete = async (courseId) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return
    }
    setDeletingId(courseId)
    try {
      await api.delete(`/courses/${courseId}`)
      setCourses(courses.filter((c) => c.id !== courseId))
      setStats({ ...stats, totalCourses: stats.totalCourses - 1 })
    } catch (err) {
      alert('Failed to delete course. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

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
          <p className="text-rose-800">Failed to load studio data. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Instructor studio</h1>
              <p className="mt-2 text-slate-600">Manage your courses and track your performance</p>
            </div>
            <Link
              to="/studio/courses/new"
              className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
            >
              <PlusIcon size={18} /> Create course
            </Link>
          </div>
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
                <p className="text-sm text-slate-500">Total courses</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-100 text-emerald-600">
                <UsersIcon size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.totalStudents}</p>
                <p className="text-sm text-slate-500">Total students</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-amber-100 text-amber-600">
                <DollarIcon size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{formatPrice(stats.totalRevenue)}</p>
                <p className="text-sm text-slate-500">Total revenue</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-purple-100 text-purple-600">
                <ChartIcon size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.totalCourses > 0 ? (stats.totalStudents / stats.totalCourses).toFixed(1) : '0'}
                </p>
                <p className="text-sm text-slate-500">Avg students/course</p>
              </div>
            </div>
          </div>
        </div>

        {/* Courses list */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Your courses</h2>
          </div>

          {courses.length === 0 ? (
            <EmptyState
              title="No courses yet"
              description="Create your first course and start sharing your knowledge"
              actionLabel="Create your first course"
              onAction={() => navigate('/studio/courses/new')}
            />
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Students
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {courses.map((course) => (
                    <tr key={course.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                            {course.thumbnailUrl ? (
                              <img
                                src={course.thumbnailUrl}
                                alt={course.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="grid h-full w-full place-items-center bg-gradient-to-br from-brand-500 to-brand-700 text-white text-xs">
                                📚
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link
                              to={`/courses/${course.id}`}
                              className="block font-medium text-slate-900 hover:text-brand-600 line-clamp-1"
                            >
                              {course.title}
                            </Link>
                            <p className="mt-1 text-xs text-slate-500">
                              {course.totalLessons || 0} lessons • {course.category}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{course.numStudents || 0}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-amber-600">
                            {(course.avgRating || 0).toFixed(1)}
                          </span>
                          <span className="text-slate-400">({course.numReviews || 0})</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {formatPrice(course.price)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            course.status === 'published'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {course.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/studio/courses/${course.id}/edit`}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                            title="Edit course"
                          >
                            <EditIcon size={18} />
                          </Link>
                          <button
                            onClick={() => handleDelete(course.id)}
                            disabled={deletingId === course.id}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Delete course"
                          >
                            <TrashIcon size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick tips */}
        {courses.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-6 text-xl font-bold text-slate-900">Tips for success</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand-100 text-brand-600">
                  <BookIcon size={20} />
                </div>
                <h3 className="mt-3 font-semibold text-slate-900">Keep content updated</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Regularly update your courses with new content to keep students engaged.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-100 text-emerald-600">
                  <UsersIcon size={20} />
                </div>
                <h3 className="mt-3 font-semibold text-slate-900">Engage with students</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Respond to questions and reviews to build a strong community.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-amber-100 text-amber-600">
                  <ChartIcon size={20} />
                </div>
                <h3 className="mt-3 font-semibold text-slate-900">Analyze performance</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Monitor your course metrics to understand what's working well.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
