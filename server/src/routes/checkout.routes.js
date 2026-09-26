import { Router } from 'express'
import { mockCheckout } from '../controllers/checkout.controller.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.post('/:courseId', protect, mockCheckout)

export default router
