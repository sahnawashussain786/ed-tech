import { User } from '../models/index.js'
import { signToken } from '../utils/token.js'
import { BadRequestError, UnauthorizedError } from '../utils/errors.js'

function sendAuthResponse(res, user, statusCode = 200) {
  const token = signToken(user._id)
  res.status(statusCode).json({ token, user: user.toPublicJSON() })
}

export async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body || {}

    if (!name || !email || !password) throw new BadRequestError('Name, email and password are required')
    if (String(password).length < 6) throw new BadRequestError('Password must be at least 6 characters')
    if (role && !['student', 'instructor'].includes(role)) throw new BadRequestError('Invalid role')

    const exists = await User.findOne({ email: String(email).toLowerCase().trim() })
    if (exists) throw new BadRequestError('An account with that email already exists')

    const user = await User.create({
      name: String(name).trim(),
      email: String(email).toLowerCase().trim(),
      password,
      role: role === 'instructor' ? 'instructor' : 'student',
    })

    return sendAuthResponse(res, user, 201)
  } catch (err) {
    next(err)
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body || {}
    if (!email || !password) throw new BadRequestError('Email and password are required')

    const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select('+password')
    if (!user || !(await user.comparePassword(password))) {
      throw new UnauthorizedError('Incorrect email or password')
    }

    return sendAuthResponse(res, user)
  } catch (err) {
    next(err)
  }
}

export async function getMe(req, res, next) {
  try {
    return res.json({ user: req.user.toPublicJSON() })
  } catch (err) {
    next(err)
  }
}

export async function updateMe(req, res, next) {
  try {
    const allowed = ['name', 'bio', 'headline', 'avatarUrl']
    const updates = {}
    for (const key of allowed) {
      if (req.body?.[key] !== undefined) updates[key] = String(req.body[key]).slice(0, 2000)
    }
    if (Object.keys(updates).length === 0) throw new BadRequestError('Nothing to update')

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true })
    return res.json({ user: user.toPublicJSON() })
  } catch (err) {
    next(err)
  }
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body || {}
    if (!currentPassword || !newPassword) {
      throw new BadRequestError('Current and new password are required')
    }
    if (String(newPassword).length < 6) throw new BadRequestError('New password must be at least 6 characters')

    const user = await User.findById(req.user._id).select('+password')
    if (!(await user.comparePassword(currentPassword))) {
      throw new UnauthorizedError('Current password is incorrect')
    }

    user.password = newPassword
    await user.save()

    return sendAuthResponse(res, user)
  } catch (err) {
    next(err)
  }
}
