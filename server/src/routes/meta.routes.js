import { Router } from 'express'

const router = Router()

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
const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels']

router.get('/course-fields', (_req, res) => res.json({ categories: CATEGORIES, levels: LEVELS }))

export default router
