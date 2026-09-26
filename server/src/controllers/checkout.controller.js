import { Course, Order } from '../models/index.js'
import { BadRequestError, NotFoundError } from '../utils/errors.js'
import { enrollStudent, incrementCourseStudents } from './enrollment.controller.js'

/**
 * POST /api/checkout/:courseId  { cardName }
 * Mock payment gateway: validates a fake card flow, records an Order,
 * creates the Enrollment and increments the course's student count.
 *
 * Swap this controller for Stripe Checkout later — the client contract
 * (POST checkout → enrollment created) stays the same.
 */
export async function mockCheckout(req, res, next) {
  try {
    const { cardName } = req.body || {}
    if (!cardName || !String(cardName).trim()) throw new BadRequestError('Cardholder name is required')

    const course = await Course.findById(req.params.courseId)
    if (!course || course.status !== 'published') throw new NotFoundError('Course not found')
    if (String(course.instructor) === String(req.user._id)) {
      throw new BadRequestError('You cannot purchase your own course')
    }

    const alreadyOrdered = await Order.findOne({
      student: req.user._id,
      course: course._id,
      status: 'paid',
    })
    if (alreadyOrdered) throw new BadRequestError('You already own this course')

    // Simulate gateway latency
    await new Promise((resolve) => setTimeout(resolve, 400))

    const order = await Order.create({
      student: req.user._id,
      course: course._id,
      amount: course.price,
      status: 'paid',
      provider: 'mock',
      providerRef: `mock_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
      paidAt: new Date(),
    })

    const enrollment = await enrollStudent(req.user._id, course._id)
    await incrementCourseStudents(course._id)

    res.status(201).json({
      order: { id: order.id, amount: order.amount, providerRef: order.providerRef, paidAt: order.paidAt },
      enrollmentId: enrollment.id,
      courseId: course._id,
      message: `Payment simulated — you now own “${course.title}”`,
    })
  } catch (err) {
    next(err)
  }
}
