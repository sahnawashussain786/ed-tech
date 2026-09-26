import mongoose from 'mongoose'
import { Review, Course } from '../models/index.js'

/**
 * Recompute and persist avgRating / numReviews on a course.
 */
export async function recomputeCourseRating(courseId) {
  const courseIdObj =
    courseId instanceof mongoose.Types.ObjectId ? courseId : new mongoose.Types.ObjectId(String(courseId))

  const [stats] = await Review.aggregate([
    { $match: { course: courseIdObj } },
    { $group: { _id: '$course', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ])

  await Course.findByIdAndUpdate(courseIdObj, {
    avgRating: stats ? Math.round(stats.avg * 10) / 10 : 0,
    numReviews: stats ? stats.count : 0,
  })
}
