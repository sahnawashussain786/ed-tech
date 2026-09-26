import { User, Course } from '../models/index.js'
import { NotFoundError } from '../utils/errors.js'

/**
 * GET /api/users/:id — public profile with the instructor's published courses.
 */
export async function publicProfile(req, res, next) {
  try {
    const user = await User.findById(req.params.id).lean()
    if (!user) throw new NotFoundError('User not found')

    const courses = await Course.find({ instructor: user._id, status: 'published' })
      .sort('-numStudents')
      .lean({ virtuals: true })

    const taught = courses.reduce((n, c) => n + (c.sections?.reduce((m, s) => m + (s.lessons?.length || 0), 0) || 0), 0)

    res.json({
      profile: {
        id: user._id,
        name: user.name,
        headline: user.headline,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        stats: {
          courses: courses.length,
          students: courses.reduce((n, c) => n + (c.numStudents || 0), 0),
          reviews: courses.reduce((n, c) => n + (c.numReviews || 0), 0),
          lessons: taught,
          avgRating:
            courses.length
              ? Math.round(
                  (courses.reduce((n, c) => n + (c.avgRating || 0), 0) / courses.length) * 10,
                ) / 10
              : 0,
        },
        courses: courses.map((c) => ({
          ...c,
          id: c._id,
          totalLessons: c.sections?.reduce((n, s) => n + (s.lessons?.length || 0), 0) || 0,
          totalMinutes:
            c.sections?.reduce((n, s) => n + s.lessons?.reduce((m, l) => m + (l.durationMin || 0), 0), 0) || 0,
          instructor: { id: user._id, name: user.name },
        })),
      },
    })
  } catch (err) {
    next(err)
  }
}
