import { Enrollment, Course, Order } from '../models/index.js'
import { NotFoundError, BadRequestError } from '../utils/errors.js'

/**
 * GET /api/enrollments/my — the logged-in student's courses with progress.
 */
export async function myEnrollments(req, res, next) {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate({ path: 'course', populate: { path: 'instructor', select: 'name' } })
      .sort('-createdAt')

    const items = enrollments
      .filter((e) => e.course)
      .map((e) => {
        const course = e.course
        const totalLessons = course.sections?.reduce((n, s) => n + (s.lessons?.length || 0), 0) || 0
        const done = e.completedLessons?.length || 0
        return {
          id: e.id,
          enrolledAt: e.createdAt,
          completedLessons: e.completedLessons?.map(String) || [],
          lastLessonId: e.lastLessonId ? String(e.lastLessonId) : null,
          progressPercent: totalLessons ? Math.round((done / totalLessons) * 100) : 0,
          course: {
            id: course._id,
            title: course.title,
            slug: null,
            thumbnailUrl: course.thumbnailUrl,
            category: course.category,
            totalLessons,
            totalMinutes:
              course.sections?.reduce((n, s) => n + s.lessons?.reduce((m, l) => m + (l.durationMin || 0), 0), 0) || 0,
            instructor: course.instructor ? { id: course.instructor._id, name: course.instructor.name } : null,
          },
        }
      })

    res.json({ items })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/enrollments/:courseId/progress  { lessonId, completed }
 * Marks a lesson complete/incomplete for the enrolled student.
 */
export async function updateProgress(req, res, next) {
  try {
    const { lessonId, completed = true } = req.body || {}
    if (!lessonId) throw new BadRequestError('lessonId is required')

    const enrollment = await Enrollment.findOne({ student: req.user._id, course: req.params.courseId })
    if (!enrollment) throw new NotFoundError('You are not enrolled in this course')

    const course = await Course.findById(req.params.courseId)
    const lessonExists = course?.sections?.some((s) => s.lessons?.some((l) => String(l._id) === String(lessonId)))
    if (!lessonExists) throw new NotFoundError('Lesson not found in this course')

    const set = new Set((enrollment.completedLessons || []).map(String))
    if (completed) set.add(String(lessonId))
    else set.delete(String(lessonId))

    enrollment.completedLessons = [...set]
    enrollment.lastLessonId = lessonId
    await enrollment.save()

    const totalLessons = course.sections?.reduce((n, s) => n + (s.lessons?.length || 0), 0) || 0
    const done = enrollment.completedLessons.length

    res.json({
      enrollment: {
        id: enrollment.id,
        completedLessons: enrollment.completedLessons.map(String),
        lastLessonId: String(lessonId),
        progressPercent: totalLessons ? Math.round((done / totalLessons) * 100) : 0,
      },
    })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/enrollments/:courseId — entitlement check + progress snapshot.
 */
export async function getEnrollment(req, res, next) {
  try {
    const enrollment = await Enrollment.findOne({ student: req.user._id, course: req.params.courseId })
    if (!enrollment) throw new NotFoundError('You are not enrolled in this course')

    const course = await Course.findById(req.params.courseId)
    const totalLessons = course?.sections?.reduce((n, s) => n + (s.lessons?.length || 0), 0) || 0

    res.json({
      enrollment: {
        id: enrollment.id,
        completedLessons: enrollment.completedLessons?.map(String) || [],
        lastLessonId: enrollment.lastLessonId ? String(enrollment.lastLessonId) : null,
        progressPercent: totalLessons ? Math.round((enrollment.completedLessons?.length || 0) / totalLessons * 100) : 0,
      },
    })
  } catch (err) {
    next(err)
  }
}

/**
 * Internal: create an enrollment (used by checkout).
 */
export async function enrollStudent(studentId, courseId) {
  const existing = await Enrollment.findOne({ student: studentId, course: courseId })
  if (existing) return existing
  return Enrollment.create({ student: studentId, course: courseId })
}

/**
 * Internal: increment the course's student count (used by checkout).
 */
export async function incrementCourseStudents(courseId) {
  await Course.updateOne({ _id: courseId }, { $inc: { numStudents: 1 } })
}

/**
 * GET /api/enrollments/orders — the student's purchase history.
 */
export async function myOrders(req, res, next) {
  try {
    const orders = await Order.find({ student: req.user._id, status: 'paid' })
      .populate('course', 'title thumbnailUrl price category')
      .sort('-createdAt')

    res.json({
      items: orders.filter((o) => o.course).map((o) => ({
        id: o.id,
        amount: o.amount,
        providerRef: o.providerRef,
        paidAt: o.paidAt || o.createdAt,
        course: {
          id: o.course._id,
          title: o.course.title,
          thumbnailUrl: o.course.thumbnailUrl,
          price: o.course.price,
          category: o.course.category,
        },
      })),
    })
  } catch (err) {
    next(err)
  }
}
