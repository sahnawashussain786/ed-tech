import { Course, User, Enrollment } from '../models/index.js'
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/errors.js'

const CATEGORIES = [
  'Development',
  'Business',
  'Design',
  'Marketing',
  'Data Science',
  'Photography',
  'Music',
  'Personal Development',
]

/**
 * GET /api/courses?search=&category=&level=&sort=&page=&limit=&instructor=&status=
 * Public: only published courses (instructors see their own drafts via /instructor endpoints).
 */
export async function listCourses(req, res, next) {
  try {
    const { search, category, level, sort = 'popular', instructor, status } = req.query
    const page = Math.max(1, parseInt(req.query.page, 10) || 1)
    const limit = Math.min(48, Math.max(1, parseInt(req.query.limit, 10) || 12))

    const filter = { status: 'published' }
    if (req.user?.role === 'instructor' && instructor && String(instructor) === String(req.user._id)) {
      // Instructor browsing their own catalog (incl. drafts) from the studio
      delete filter.status
      filter.instructor = req.user._id
      if (status === 'draft' || status === 'published') filter.status = status
    }
    if (category && CATEGORIES.includes(category)) filter.category = category
    if (level) filter.level = level

    if (search) {
      const rx = new RegExp(String(search).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
      filter.$or = [{ title: rx }, { subtitle: rx }, { tags: rx }, { description: rx }]
    }

    const sorts = {
      popular: { numStudents: -1 },
      'rating-desc': { avgRating: -1 },
      'price-asc': { price: 1 },
      'price-desc': { price: -1 },
      newest: { createdAt: -1 },
    }
    const sortSpec = sorts[sort] || sorts.popular

    const [items, total] = await Promise.all([
      Course.find(filter)
        .populate('instructor', 'name')
        .sort(sortSpec)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean({ virtuals: true }),
      Course.countDocuments(filter),
    ])

    res.json({
      items: items.map((c) => ({
        ...c,
        id: c._id,
        totalLessons: c.sections?.reduce((n, s) => n + (s.lessons?.length || 0), 0) || 0,
        totalMinutes:
          c.sections?.reduce((n, s) => n + s.lessons?.reduce((m, l) => m + (l.durationMin || 0), 0), 0) || 0,
        instructor: c.instructor?._id ? { id: c.instructor._id, name: c.instructor.name } : null,
      })),
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
    })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/courses/:id — full course outline. Unauthenticated users get only preview lessons.
 */
export async function getCourse(req, res, next) {
  try {
    const course = await Course.findById(req.params.id).populate('instructor', 'name headline bio avatarUrl')
    if (!course) throw new NotFoundError('Course not found')

    const isOwner = Boolean(req.user && String(course.instructor._id) === String(req.user._id))
    if (course.status === 'draft' && !isOwner) throw new NotFoundError('Course not found')

    // Check real entitlement from the Enrollment collection
    let isEnrolled = false
    if (req.user) {
      const enrollment = await Enrollment.findOne({ student: req.user._id, course: course._id })
      isEnrolled = Boolean(enrollment)
    }

    const payload = course.toObject({ virtuals: true })
    payload.instructor = {
      id: course.instructor._id,
      name: course.instructor.name,
      headline: course.instructor.headline,
      bio: course.instructor.bio,
      avatarUrl: course.instructor.avatarUrl,
    }

    if (!isEnrolled && !isOwner) {
      // Hide video URLs of non-preview lessons from non-buyers
      payload.sections = payload.sections.map((section) => ({
        ...section,
        lessons: section.lessons.map((lesson) =>
          lesson.isPreview ? lesson : { ...lesson, videoUrl: '' },
        ),
      }))
    }

    payload.access = { isEnrolled, isOwner }
    res.json({ course: { ...payload, id: course._id } })
  } catch (err) {
    next(err)
  }
}

function requireInstructorFields(body) {
  if (!body.title || !String(body.title).trim()) throw new BadRequestError('Title is required')
  if (!body.category || !CATEGORIES.includes(body.category)) throw new BadRequestError('A valid category is required')
  if (body.price === undefined || Number.isNaN(Number(body.price)) || Number(body.price) < 0) {
    throw new BadRequestError('A non-negative price is required')
  }
}

/**
 * POST /api/courses — instructors create a draft.
 */
export async function createCourse(req, res, next) {
  try {
    requireInstructorFields(req.body || {})

    const course = await Course.create({
      title: String(req.body.title).trim(),
      subtitle: req.body.subtitle || '',
      description: req.body.description || '',
      category: req.body.category,
      level: req.body.level || 'Beginner',
      language: req.body.language || 'English',
      price: Number(req.body.price),
      thumbnailUrl: req.body.thumbnailUrl || '',
      whatYouWillLearn: Array.isArray(req.body.whatYouWillLearn) ? req.body.whatYouWillLearn.slice(0, 20) : [],
      requirements: Array.isArray(req.body.requirements) ? req.body.requirements.slice(0, 20) : [],
      tags: Array.isArray(req.body.tags) ? req.body.tags.slice(0, 20) : [],
      sections: Array.isArray(req.body.sections) ? req.body.sections : [],
      status: 'draft',
      instructor: req.user._id,
    })

    res.status(201).json({ course: course.toJSON() })
  } catch (err) {
    next(err)
  }
}

/**
 * PATCH /api/courses/:id — owner updates any field (incl. sections).
 */
export async function updateCourse(req, res, next) {
  try {
    const course = await Course.findById(req.params.id)
    if (!course) throw new NotFoundError('Course not found')
    if (String(course.instructor) !== String(req.user._id)) throw new ForbiddenError('Not your course')

    const editable = [
      'title',
      'subtitle',
      'description',
      'category',
      'level',
      'language',
      'price',
      'thumbnailUrl',
      'whatYouWillLearn',
      'requirements',
      'tags',
      'sections',
    ]
    for (const key of editable) {
      if (req.body?.[key] !== undefined) course[key] = req.body[key]
    }
    // Legacy/flat lessons payload from the editor — coerce into a single section
    if (!req.body?.sections && Array.isArray(req.body?.lessons)) {
      course.sections = [
        {
          title: 'Course content',
          lessons: req.body.lessons.map((l) => ({
            title: l.title,
            description: l.description || '',
            videoUrl: l.videoUrl || '',
            durationMin: Number(l.durationMinutes ?? l.durationMin) || 0,
            isPreview: Boolean(l.isPreview),
            resources: Array.isArray(l.resources) ? l.resources : [],
          })),
        },
      ]
    }
    if (req.body?.status !== undefined) {
      if (!['draft', 'published'].includes(req.body.status)) throw new BadRequestError('Invalid status')
      if (req.body.status === 'published' && course.totalLessons === 0) {
        throw new BadRequestError('Add at least one lesson before publishing')
      }
      course.status = req.body.status
    }

    await course.save()
    res.json({ course: course.toJSON() })
  } catch (err) {
    next(err)
  }
}

/**
 * DELETE /api/courses/:id — owner only.
 */
export async function deleteCourse(req, res, next) {
  try {
    const course = await Course.findById(req.params.id)
    if (!course) throw new NotFoundError('Course not found')
    if (String(course.instructor) !== String(req.user._id)) throw new ForbiddenError('Not your course')

    await course.deleteOne()
    res.json({ message: 'Course deleted' })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/courses/meta/categories
 */
export async function getCategories(_req, res) {
  res.json({ categories: CATEGORIES })
}

/**
 * GET /api/courses/:id/learn — the enrolled student's (or owner's) view of a
 * course: full outline with playable videos, plus progress. The client's
 * learning player loads this.
 */
export async function getCourseForLearning(req, res, next) {
  try {
    const course = await Course.findById(req.params.id).populate('instructor', 'name headline bio avatarUrl')
    if (!course) throw new NotFoundError('Course not found')

    const isOwner = Boolean(req.user && String(course.instructor._id) === String(req.user._id))

    let enrollment = null
    if (req.user) {
      enrollment = await Enrollment.findOne({ student: req.user._id, course: course._id })
    }
    if (!isOwner && !enrollment) throw new ForbiddenError('Enroll in this course to access it')

    const payload = course.toObject({ virtuals: true })
    payload.instructor = {
      id: course.instructor._id,
      name: course.instructor.name,
      headline: course.instructor.headline,
      bio: course.instructor.bio,
      avatarUrl: course.instructor.avatarUrl,
    }

    // Flatten sections into a single ordered lesson list for the player
    const lessons = []
    for (const section of payload.sections || []) {
      for (const lesson of section.lessons || []) {
        lessons.push({
          id: lesson._id,
          sectionId: section._id,
          sectionTitle: section.title,
          title: lesson.title,
          description: lesson.description || '',
          videoUrl: lesson.videoUrl || '',
          durationMin: lesson.durationMin || 0,
          durationMinutes: lesson.durationMin || 0,
          resources: lesson.resources || [],
          isPreview: Boolean(lesson.isPreview),
        })
      }
    }

    const totalLessons = lessons.length
    const completed = (enrollment?.completedLessons || []).map(String)
    const done = lessons.filter((l) => completed.includes(String(l.id))).length

    res.json({
      course: {
        ...payload,
        id: course._id,
        lessons,
        totalLessons,
        totalMinutes: lessons.reduce((n, l) => n + (l.durationMin || 0), 0),
        completedLessons: completed,
        lastLessonId: enrollment?.lastLessonId ? String(enrollment.lastLessonId) : null,
        progress: totalLessons ? Math.round((done / totalLessons) * 100) : 0,
        access: { isEnrolled: Boolean(enrollment), isOwner },
      },
    })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/courses/:id/enroll — free-course instant enrollment (no checkout).
 */
export async function enrollFree(req, res, next) {
  try {
    const course = await Course.findById(req.params.id)
    if (!course || course.status !== 'published') throw new NotFoundError('Course not found')
    if (course.price > 0) throw new BadRequestError('This course is not free — use checkout')
    if (String(course.instructor) === String(req.user._id)) {
      throw new BadRequestError('You cannot enroll in your own course')
    }

    const existing = await Enrollment.findOne({ student: req.user._id, course: course._id })
    if (existing) return res.json({ enrollment: { id: existing.id }, courseId: course._id, message: 'Already enrolled' })

    const enrollment = await Enrollment.create({ student: req.user._id, course: course._id })
    await Course.updateOne({ _id: course._id }, { $inc: { numStudents: 1 } })

    res.status(201).json({
      enrollment: { id: enrollment.id },
      courseId: course._id,
      message: `You now own “${course.title}”`,
    })
  } catch (err) {
    next(err)
  }
}
