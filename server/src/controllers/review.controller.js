import { Review, Enrollment, Course } from '../models/index.js'
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors.js'
import { recomputeCourseRating } from '../utils/helpers.js'

/**
 * GET /api/reviews/course/:courseId — reviews for a course.
 */
export async function listCourseReviews(req, res, next) {
  try {
    const reviews = await Review.find({ course: req.params.courseId })
      .populate('user', 'name avatarUrl headline')
      .sort('-createdAt')
      .limit(100)

    res.json({
      items: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        user: r.user ? { id: r.user._id, name: r.user.name, avatarUrl: r.user.avatarUrl, headline: r.user.headline } : null,
      })),
    })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/reviews/course/:courseId  { rating, comment }
 * Only enrolled students may review; one review per student per course.
 */
export async function upsertReview(req, res, next) {
  try {
    const { rating, comment = '' } = req.body || {}
    const ratingNum = Number(rating)
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      throw new BadRequestError('Rating must be an integer between 1 and 5')
    }

    const course = await Course.findById(req.params.courseId)
    if (!course) throw new NotFoundError('Course not found')

    const enrollment = await Enrollment.findOne({ student: req.user._id, course: course._id })
    if (!enrollment) throw new ForbiddenError('Only students enrolled in this course can review it')

    const review = await Review.findOneAndUpdate(
      { course: course._id, user: req.user._id },
      { rating: ratingNum, comment: String(comment).slice(0, 2000) },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    )

    await recomputeCourseRating(course._id)

    res.status(201).json({
      review: {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        user: { id: req.user._id, name: req.user.name, avatarUrl: req.user.avatarUrl, headline: req.user.headline },
      },
    })
  } catch (err) {
    next(err)
  }
}

/**
 * DELETE /api/reviews/:reviewId — author only.
 */
export async function deleteReview(req, res, next) {
  try {
    const review = await Review.findById(req.params.reviewId)
    if (!review) throw new NotFoundError('Review not found')
    if (String(review.user) !== String(req.user._id)) throw new ForbiddenError('Not your review')

    const courseId = review.course
    await review.deleteOne()
    await recomputeCourseRating(courseId)

    res.json({ message: 'Review deleted' })
  } catch (err) {
    next(err)
  }
}
