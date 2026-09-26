import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Spinner from '../components/Spinner.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { Stars } from '../components/Stars.jsx'
import { useCourse, useReviews } from '../hooks/useCourses.js'
import { useAuth } from '../context/AuthContext.jsx'
import { api, apiErrorMessage } from '../lib/api.js'
import { formatPrice, formatDuration, formatDate, pluralize } from '../lib/format.js'
import { UsersIcon, ClockIcon, BookIcon, CheckIcon, LockIcon, StarIcon, PlayIcon } from '../components/Icons.jsx'

export default function CourseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { course, loading: courseLoading, error: courseError } = useCourse(id)
  const { items: reviews, loading: reviewsLoading, setItems } = useReviews(id)
  const [enrolling, setEnrolling] = useState(false)
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [submittingReview, setSubmittingReview] = useState(false)

  const access = course?.access || {}
  const isEnrolled = Boolean(access.isEnrolled)
  const isInstructor = Boolean(access.isOwner)
  const canReview = isEnrolled && !isInstructor && !reviews.some((r) => r.user?.id === user?.id)

  const handleEnroll = () => {
    if (!user) {
      navigate(`/login?redirect=/courses/${id}`)
      return
    }
    if (Number(course.price) > 0) {
      // Paid courses go straight to checkout (checkout creates the enrollment)
      navigate(`/checkout/${id}`)
      return
    }
    // Free courses enroll instantly
    setEnrolling(true)
    api
      .post(`/courses/${id}/enroll`)
      .then(() => navigate(`/learn/${id}`))
      .catch((err) => alert(apiErrorMessage(err)))
      .finally(() => setEnrolling(false))
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!reviewText.trim()) return
    setSubmittingReview(true)
    try {
      const res = await api.post(`/reviews/course/${id}`, { rating: reviewRating, comment: reviewText })
      setItems([res.data.review, ...reviews])
      setReviewText('')
      setReviewRating(5)
    } catch (err) {
      alert(apiErrorMessage(err))
    } finally {
      setSubmittingReview(false)
    }
  }

  if (courseLoading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Spinner />
      </div>
    )
  }

  if (courseError || !course) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState title="Course not found" description="The course you're looking for doesn't exist or has been removed." />
      </div>
    )
  }

  const { totalLessons = 0, totalMinutes = 0, avgRating = 0, numReviews = 0 } = course

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero section */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
            <div className="flex-1">
              <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
                <span className="rounded-full bg-brand-100 px-3 py-1 font-medium text-brand-700">{course.category}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-600">{course.level}</span>
                {course.status === 'draft' && (
                  <>
                    <span className="text-slate-500">•</span>
                    <span className="rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-700">Draft</span>
                  </>
                )}
              </div>

              <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl lg:text-5xl">{course.title}</h1>
              {course.subtitle && <p className="mt-3 text-lg text-slate-600">{course.subtitle}</p>}

              <div className="mt-4 flex flex-wrap items-center gap-6 text-sm text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-amber-600">{avgRating.toFixed(1)}</span>
                  <Stars rating={avgRating} />
                  <span className="text-slate-400">({pluralize(numReviews, 'rating')})</span>
                </div>
                <span className="inline-flex items-center gap-1.5">
                  <UsersIcon size={16} /> {pluralize(course.numStudents || 0, 'student')}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <BookIcon size={16} /> {pluralize(totalLessons, 'lesson')}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ClockIcon size={16} /> {formatDuration(totalMinutes)}
                </span>
              </div>

              <div className="mt-6 flex items-center gap-3">
                {course.instructor?.avatarUrl ? (
                  <img
                    src={course.instructor.avatarUrl}
                    alt={course.instructor.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                    {course.instructor?.name?.[0] || '?'}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-slate-900">{course.instructor?.name || 'Unknown instructor'}</p>
                  <p className="text-xs text-slate-500">Course instructor</p>
                </div>
              </div>

              <p className="mt-6 text-sm text-slate-500">Last updated {formatDate(course.updatedAt)}</p>
            </div>

            {/* Course card */}
            <div className="lg:w-96">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
                <div className="relative aspect-video bg-slate-100">
                  {course.thumbnailUrl ? (
                    <img src={course.thumbnailUrl} alt={course.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-gradient-to-br from-brand-500 to-brand-700 text-white">
                      <BookIcon size={48} />
                    </div>
                  )}
                  {isEnrolled && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Link
                        to={`/learn/${id}`}
                        className="flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-slate-900 shadow-lg transition hover:bg-white/90"
                      >
                        <PlayIcon size={20} />
                        Go to course
                      </Link>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="mb-4 text-3xl font-extrabold text-slate-900">{formatPrice(course.price)}</div>

                  {isEnrolled ? (
                    <Link
                      to={`/learn/${id}`}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-brand-700"
                    >
                      <PlayIcon size={20} /> Continue learning
                    </Link>
                  ) : (
                    <button
                      onClick={handleEnroll}
                      disabled={enrolling || course.status === 'draft'}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {enrolling ? 'Processing...' : course.status === 'draft' ? 'Course not published' : 'Enroll now'}
                    </button>
                  )}

                  <p className="mt-3 text-center text-xs text-slate-500">30-day money-back guarantee</p>

                  <div className="mt-6 space-y-3">
                    <h3 className="font-semibold text-slate-900">This course includes:</h3>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li className="flex items-center gap-2">
                        <PlayIcon size={16} /> {pluralize(totalLessons, 'video lesson')}
                      </li>
                      <li className="flex items-center gap-2">
                        <ClockIcon size={16} /> {formatDuration(totalMinutes)} of on-demand video
                      </li>
                      <li className="flex items-center gap-2">
                        <BookIcon size={16} /> Downloadable resources
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckIcon size={16} /> Access on mobile and TV
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckIcon size={16} /> Certificate of completion
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-12">
          <div className="flex-1 space-y-12">
            {/* What you'll learn */}
            {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-slate-900">What you'll learn</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {course.whatYouWillLearn.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckIcon size={20} className="mt-0.5 shrink-0 text-brand-600" />
                      <span className="text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Course content */}
            {course.sections && course.sections.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-slate-900">Course content</h2>
                <p className="mt-1 text-sm text-slate-600">
                  {pluralize(course.sections.length, 'section')} • {pluralize(totalLessons, 'lesson')} •{' '}
                  {formatDuration(totalMinutes)} total length
                </p>

                <div className="mt-4 space-y-4">
                  {course.sections.map((section, sIdx) => (
                    <div key={section.id || sIdx} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                      <div className="border-b border-slate-100 bg-slate-50 px-4 py-2.5">
                        <h3 className="text-sm font-semibold text-slate-900">{section.title}</h3>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {section.lessons.map((lesson, idx) => (
                          <div key={lesson.id || idx} className="flex items-center gap-4 p-4">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-medium text-slate-600">
                              {idx + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-slate-900">{lesson.title}</h4>
                              <p className="text-xs text-slate-500">{formatDuration(lesson.durationMin || 0)}</p>
                            </div>
                            {lesson.isPreview ? (
                              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                                Preview
                              </span>
                            ) : !isEnrolled && !isInstructor ? (
                              <LockIcon size={16} className="text-slate-400" />
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Description */}
            {course.description && (
              <section>
                <h2 className="text-2xl font-bold text-slate-900">Description</h2>
                <div className="mt-4 prose prose-slate max-w-none text-slate-700">
                  {course.description.split('\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900">Student reviews</h2>
              <div className="mt-4">
                {reviewsLoading ? (
                  <div className="grid place-items-center py-8">
                    <Spinner />
                  </div>
                ) : reviews.length === 0 ? (
                  <p className="text-slate-500">No reviews yet. Be the first to review this course!</p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="rounded-xl border border-slate-200 bg-white p-5">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="grid h-10 w-10 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                              {review.user?.name?.[0] || '?'}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{review.user?.name || 'Anonymous'}</p>
                              <div className="flex items-center gap-1.5">
                                <Stars rating={review.rating} />
                                <span className="text-xs text-slate-500">{formatDate(review.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        {review.comment && <p className="mt-3 text-slate-700">{review.comment}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add review form */}
              {canReview && (
                <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
                  <h3 className="font-semibold text-slate-900">Write a review</h3>
                  <form onSubmit={handleSubmitReview} className="mt-4 space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Rating</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setReviewRating(n)}
                            className="text-2xl transition hover:scale-110"
                          >
                            <StarIcon size={24} filled={n <= reviewRating} className={n <= reviewRating ? 'text-amber-500' : 'text-slate-300'} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Your review</label>
                      <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        rows={4}
                        placeholder="Share your experience with this course..."
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit review'}
                    </button>
                  </form>
                </div>
              )}
            </section>
          </div>

          {/* Instructor sidebar */}
          <aside className="lg:w-80">
            <div className="sticky top-24 rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="font-semibold text-slate-900">Instructor</h3>
              <div className="mt-4 flex items-center gap-4">
                {course.instructor?.avatarUrl ? (
                  <img
                    src={course.instructor.avatarUrl}
                    alt={course.instructor.name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="grid h-16 w-16 place-items-center rounded-full bg-brand-100 text-xl font-bold text-brand-700">
                    {course.instructor?.name?.[0] || '?'}
                  </div>
                )}
                <div>
                  <p className="font-medium text-slate-900">{course.instructor?.name || 'Unknown'}</p>
                  <p className="text-sm text-slate-500">Course instructor</p>
                </div>
              </div>
              {course.instructor?.bio && (
                <p className="mt-4 text-sm text-slate-600">{course.instructor.bio}</p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
