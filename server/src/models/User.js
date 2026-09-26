import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['student', 'instructor'], default: 'student' },
    bio: { type: String, default: '', maxlength: 600 },
    headline: { type: String, default: '', maxlength: 120 },
    avatarUrl: { type: String, default: '' },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
)

userSchema.virtual('enrollments', {
  ref: 'Enrollment',
  localField: '_id',
  foreignField: 'student',
})

userSchema.virtual('courses', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'instructor',
})

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password)
}

userSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    bio: this.bio,
    headline: this.headline,
    avatarUrl: this.avatarUrl,
    createdAt: this.createdAt,
  }
}

export const User = mongoose.model('User', userSchema)
