import { Router } from 'express'
import { publicProfile } from '../controllers/user.controller.js'

const router = Router()

router.get('/:id', publicProfile)

export default router
