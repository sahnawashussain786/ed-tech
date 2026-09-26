import { Router } from 'express'
import { overview, myCourses } from '../controllers/instructor.controller.js'
import { protect, requireRole } from '../middleware/auth.js'

const router = Router()

router.get('/overview', protect, requireRole('instructor'), overview)
router.get('/courses', protect, requireRole('instructor'), myCourses)

export default router
