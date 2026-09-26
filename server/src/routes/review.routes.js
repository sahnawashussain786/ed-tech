import { Router } from 'express'
import { listCourseReviews, upsertReview, deleteReview } from '../controllers/review.controller.js'
import { protect, optionalAuth } from '../middleware/auth.js'

const router = Router()

router.get('/course/:courseId', optionalAuth, listCourseReviews)
router.post('/course/:courseId', protect, upsertReview)
router.delete('/:reviewId', protect, deleteReview)

export default router
