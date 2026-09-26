import { Router } from 'express'
import { getLesson } from '../controllers/lesson.controller.js'
import { optionalAuth } from '../middleware/auth.js'

const router = Router()

router.get('/:courseId/:sectionId/:lessonId', optionalAuth, getLesson)

export default router
