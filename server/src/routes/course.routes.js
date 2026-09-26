import { Router } from 'express'
import {
  listCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getCategories,
  getCourseForLearning,
  enrollFree,
} from '../controllers/course.controller.js'
import { protect, optionalAuth, requireRole } from '../middleware/auth.js'

const router = Router()

router.get('/', optionalAuth, listCourses)
router.get('/meta/categories', getCategories)
router.get('/:id/learn', protect, getCourseForLearning)
router.post('/:id/enroll', protect, enrollFree)
router.get('/:id', optionalAuth, getCourse)
router.post('/', protect, requireRole('instructor'), createCourse)
router.patch('/:id', protect, requireRole('instructor'), updateCourse)
router.delete('/:id', protect, requireRole('instructor'), deleteCourse)

export default router
