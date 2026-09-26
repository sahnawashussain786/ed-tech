import { Course, Enrollment, Order } from '../models/index.js'

/**
 * GET /api/instructor/overview — KPIs for the instructor studio dashboard.
 */
export async function overview(req, res, next) {
  try {
    const instructorId = req.user._id

    const courses = await Course.find({ instructor: instructorId }).lean({ virtuals: true })
    const courseIds = courses.map((c) => c._id)

    const [enrollmentCount, revenueAgg] = await Promise.all([
      Enrollment.countDocuments({ course: { $in: courseIds } }),
      Order.aggregate([
        { $match: { status: 'paid', course: { $in: courseIds } } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
    ])

    const revenue = revenueAgg[0]?.total || 0
    const sales = revenueAgg[0]?.count || 0

    const totals = courses.reduce(
      (acc, c) => {
        acc.lessons += c.sections?.reduce((n, s) => n + (s.lessons?.length || 0), 0) || 0
        acc.minutes += c.sections?.reduce((n, s) => n + s.lessons?.reduce((m, l) => m + (l.durationMin || 0), 0), 0) || 0
        if (c.status === 'published') acc.published += 1
        else acc.drafts += 1
        acc.ratingSum += (c.avgRating || 0) * (c.numReviews || 0)
        acc.reviewCount += c.numReviews || 0
        return acc
      },
      { lessons: 0, minutes: 0, published: 0, drafts: 0, ratingSum: 0, reviewCount: 0 },
    )

    res.json({
      stats: {
        courses: courses.length,
        published: totals.published,
        drafts: totals.drafts,
        students: enrollmentCount,
        revenue,
        sales,
        lessons: totals.lessons,
        totalMinutes: totals.minutes,
        avgRating: totals.reviewCount ? Math.round((totals.ratingSum / totals.reviewCount) * 10) / 10 : 0,
        numReviews: totals.reviewCount,
      },
    })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/instructor/courses — all of the instructor's courses (drafts included).
 */
export async function myCourses(req, res, next) {
  try {
    const courses = await Course.find({ instructor: req.user._id })
      .sort('-createdAt')
      .lean({ virtuals: true })

    res.json({
      items: courses.map((c) => ({
        ...c,
        id: c._id,
        totalLessons: c.sections?.reduce((n, s) => n + (s.lessons?.length || 0), 0) || 0,
        totalMinutes:
          c.sections?.reduce((n, s) => n + s.lessons?.reduce((m, l) => m + (l.durationMin || 0), 0), 0) || 0,
      })),
    })
  } catch (err) {
    next(err)
  }
}
