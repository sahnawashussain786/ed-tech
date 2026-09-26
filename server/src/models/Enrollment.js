import mongoose from 'mongoose'

const enrollmentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    completedLessons: { type: [mongoose.Schema.Types.ObjectId], default: [] },
    lastLessonId: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { timestamps: true },
)

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true })

export const Enrollment = mongoose.model('Enrollment', enrollmentSchema)
