import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import Spinner from '../components/Spinner.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { api, apiErrorMessage } from '../lib/api.js'
import { formatDuration } from '../lib/format.js'
import { ChevronLeftIcon, ChevronRightIcon, CheckIcon, PlayIcon, LockIcon, XIcon, MenuIcon } from '../components/Icons.jsx'

// YouTube embed URLs (youtube.com/embed/…) must render in an iframe — the
// <video> element cannot play them.
function isYouTubeUrl(url) {
  return typeof url === 'string' && /youtube\.com\/embed\//i.test(url)
}

export default function Learn() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [course, setCourse] = useState(null)
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [markingComplete, setMarkingComplete] = useState(false)
  const videoRef = useRef(null)

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true)
        const res = await api.get(`/courses/${courseId}/learn`)
        const data = res.data.course
        setCourse(data)
        if (data.lastLessonId) {
          const index = data.lessons.findIndex((l) => l.id === data.lastLessonId)
          if (index !== -1) setCurrentLessonIndex(index)
        }
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }
    fetchCourse()
  }, [courseId])

  const currentLesson = course?.lessons?.[currentLessonIndex]
  const completedLessons = course?.completedLessons || []
  const isLessonComplete = currentLesson ? completedLessons.includes(currentLesson.id) : false
  const progress = course?.progress || 0

  const handlePrevious = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1)
    }
  }

  const handleNext = () => {
    if (currentLessonIndex < (course?.lessons?.length || 0) - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1)
    }
  }

  const handleLessonClick = (index) => {
    setCurrentLessonIndex(index)
  }

  const handleMarkComplete = async () => {
    if (!currentLesson || markingComplete) return
    setMarkingComplete(true)
    try {
      const res = await api.post(`/enrollments/${courseId}/progress`, {
        lessonId: currentLesson.id,
        completed: true,
      })
      const updated = res.data.enrollment || {}
      setCourse({
        ...course,
        completedLessons: updated.completedLessons || [...completedLessons, currentLesson.id],
        progress: updated.progressPercent ?? course.progress,
      })
    } catch (err) {
      alert(apiErrorMessage(err))
    } finally {
      setMarkingComplete(false)
    }
  }

  const handleExit = () => {
    navigate('/dashboard')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Spinner />
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <div className="max-w-md text-center">
          <EmptyState
            title="Course not available"
            description="You don't have access to this course or it doesn't exist."
            actionLabel="Back to dashboard"
            onAction={handleExit}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={handleExit}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            title="Exit to dashboard"
          >
            <XIcon size={20} />
          </button>
          <div className="hidden sm:block">
            <h1 className="text-sm font-medium text-white line-clamp-1">{course.title}</h1>
            <p className="text-xs text-slate-400">{currentLesson?.title || 'Select a lesson'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <span className="hidden sm:inline">Progress:</span>
            <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-700">
              <div className="h-full bg-brand-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs font-medium">{progress.toFixed(0)}%</span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white lg:hidden"
          >
            {sidebarOpen ? <XIcon size={20} /> : <MenuIcon size={20} />}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - lesson list */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-80 transform border-r border-slate-800 bg-slate-900 pt-16 transition-transform lg:relative lg:pt-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex h-full flex-col">
            <div className="border-b border-slate-800 p-4">
              <h2 className="text-sm font-semibold text-white">Course content</h2>
              <p className="mt-1 text-xs text-slate-400">
                {completedLessons.length} of {course.lessons.length} lessons completed
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {course.lessons.map((lesson, index) => {
                const isCompleted = completedLessons.includes(lesson.id)
                const isCurrent = index === currentLessonIndex

                return (
                  <button
                    key={lesson.id}
                    onClick={() => handleLessonClick(index)}
                    className={`w-full rounded-lg p-3 text-left transition ${
                      isCurrent
                        ? 'bg-brand-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        {isCompleted ? (
                          <CheckIcon size={16} className={isCurrent ? 'text-white' : 'text-emerald-400'} />
                        ) : (
                          <span className="flex h-4 w-4 items-center justify-center rounded-full border border-slate-600 text-xs">
                            {index + 1}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-2">{lesson.title}</p>
                        <p className="mt-1 text-xs opacity-70">{formatDuration(lesson.durationMinutes || 0)}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {currentLesson ? (
            <div className="mx-auto max-w-5xl px-4 py-8">
              {/* Video player */}
              <div className="relative aspect-video overflow-hidden rounded-xl bg-black shadow-2xl">
                {currentLesson.videoUrl ? (
                  isYouTubeUrl(currentLesson.videoUrl) ? (
                    <iframe
                      src={currentLesson.videoUrl}
                      title={currentLesson.title}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      ref={videoRef}
                      src={currentLesson.videoUrl}
                      controls
                      className="h-full w-full"
                      poster={course.thumbnailUrl}
                    >
                      Your browser does not support the video tag.
                    </video>
                  )
                ) : (
                  <div className="grid h-full w-full place-items-center bg-slate-800">
                    <div className="text-center">
                      <PlayIcon size={48} className="mx-auto text-slate-600" />
                      <p className="mt-4 text-slate-400">Video not available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Lesson controls */}
              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">{currentLesson.title}</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Lesson {currentLessonIndex + 1} of {course.lessons.length} •{' '}
                    {formatDuration(currentLesson.durationMinutes || 0)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePrevious}
                    disabled={currentLessonIndex === 0}
                    className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronLeftIcon size={16} /> Previous
                  </button>

                  <button
                    onClick={handleMarkComplete}
                    disabled={markingComplete || isLessonComplete}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                      isLessonComplete
                        ? 'bg-emerald-600 text-white'
                        : 'bg-brand-600 text-white hover:bg-brand-700'
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    {isLessonComplete ? (
                      <>
                        <CheckIcon size={16} /> Completed
                      </>
                    ) : (
                      <>
                        {markingComplete ? 'Marking...' : 'Mark complete'}
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleNext}
                    disabled={currentLessonIndex === course.lessons.length - 1}
                    className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next <ChevronRightIcon size={16} />
                  </button>
                </div>
              </div>

              {/* Lesson description */}
              {currentLesson.description && (
                <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
                  <h3 className="text-lg font-semibold text-white">Lesson overview</h3>
                  <div className="mt-3 prose prose-invert max-w-none text-slate-300">
                    {currentLesson.description.split('\n').map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Resources */}
              {currentLesson.resources && currentLesson.resources.length > 0 && (
                <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
                  <h3 className="text-lg font-semibold text-white">Lesson resources</h3>
                  <ul className="mt-3 space-y-2">
                    {currentLesson.resources.map((resource, i) => (
                      <li key={i}>
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-brand-400 hover:text-brand-300"
                        >
                          <span className="text-lg">📎</span>
                          <span className="text-sm">{resource.name || resource.url}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center px-4">
              <EmptyState
                title="No lessons available"
                description="This course doesn't have any lessons yet."
                actionLabel="Back to dashboard"
                onAction={handleExit}
              />
            </div>
          )}
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
