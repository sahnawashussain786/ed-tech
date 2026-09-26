import { Router } from 'express'
import {
  myEnrollments,
  updateProgress,
  getEnrollment,
  myOrders,
} from '../controllers/enrollment.controller.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.get('/my', protect, myEnrollments)
router.get('/orders', protect, myOrders)
router.get('/:courseId', protect, getEnrollment)
router.post('/:courseId/progress', protect, updateProgress)

export default router
