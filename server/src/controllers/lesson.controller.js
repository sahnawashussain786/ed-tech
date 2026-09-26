import { Course, Enrollment } from '../models/index.js'
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors.js'

/**
 * Resolve a course + the section/lesson pair from route params.
 */
async function resolveLesson(req) {
  const course = await Course.findById(req.params.courseId)
  if (!course) throw new NotFoundError('Course not found')

  const section = course.sections.id(req.params.sectionId)
  if (!section) throw new NotFoundError('Section not found')

  const lesson = section.lessons.id(req.params.lessonId)
  if (!lesson) throw new NotFoundError('Lesson not found')

  return { course, section, lesson }
}

/**
 * GET /api/lessons/:courseId/:sectionId/:lessonId
 * Returns the playable lesson (with video URL) for enrolled students, the owner, or previews.
 */
export async function getLesson(req, res, next) {
  try {
    const { course, section, lesson } = await resolveLesson(req)

    const isOwner = req.user && String(course.instructor) === String(req.user._id)
    let isEnrolled = isOwner
    if (!isEnrolled && req.user) {
      const enrollment = await Enrollment.findOne({ student: req.user._id, course: course._id })
      isEnrolled = Boolean(enrollment)
    }

    if (!lesson.isPreview && !isEnrolled) {
      throw new ForbiddenError('Enroll in this course to watch this lesson')
    }

    res.json({
      lesson: {
        id: lesson.id,
        title: lesson.title,
        videoUrl: lesson.videoUrl,
        durationMin: lesson.durationMin,
        isPreview: lesson.isPreview,
        course: { id: course._id, title: course.title },
        section: { id: section.id, title: section.title },
      },
    })
  } catch (err) {
    next(err)
  }
}

/**
 * Instructor helper: validate the sections payload shape.
 */
export function validateSectionsPayload(sections) {
  if (!Array.isArray(sections)) throw new BadRequestError('sections must be an array')
  for (const section of sections) {
    if (!section?.title) throw new BadRequestError('Every section needs a title')
    if (!Array.isArray(section.lessons)) throw new BadRequestError('Every section needs a lessons array')
    for (const lesson of section.lessons) {
      if (!lesson?.title) throw new BadRequestError('Every lesson needs a title')
      if (lesson.videoUrl && !/^https?:\/\//i.test(lesson.videoUrl)) {
        throw new BadRequestError('Video URLs must start with http:// or https://')
      }
    }
  }
}
