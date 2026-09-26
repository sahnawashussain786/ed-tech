import mongoose from 'mongoose'

const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, default: '', maxlength: 2000 },
    videoUrl: { type: String, default: '', trim: true },
    durationMin: { type: Number, default: 0, min: 0, max: 1200 },
    isPreview: { type: Boolean, default: false },
    resources: {
      type: [{ name: { type: String, default: '' }, url: { type: String, default: '' } }],
      default: [],
    },
  },
  { _id: true },
)

const sectionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    lessons: { type: [lessonSchema], default: [] },
  },
  { _id: true },
)

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    subtitle: { type: String, default: '', trim: true, maxlength: 220 },
    description: { type: String, default: '', maxlength: 5000 },
    category: {
      type: String,
      required: true,
      enum: [
        'Development',
        'Business',
        'Design',
        'Marketing',
        'Data Science',
        'Photography',
        'Music',
        'Personal Development',
      ],
    },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'], default: 'Beginner' },
    language: { type: String, default: 'English', maxlength: 40 },
    price: { type: Number, required: true, min: 0, max: 100000 },
    thumbnailUrl: { type: String, default: '' },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sections: { type: [sectionSchema], default: [] },
    status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
    whatYouWillLearn: { type: [String], default: [] },
    requirements: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    avgRating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0, min: 0 },
    numStudents: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
)

courseSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'course',
})

courseSchema.virtual('totalLessons').get(function totalLessons() {
  return this.sections?.reduce((sum, s) => sum + (s.lessons?.length || 0), 0) || 0
})

courseSchema.virtual('totalMinutes').get(function totalMinutes() {
  return (
    this.sections?.reduce(
      (sum, s) => sum + s.lessons?.reduce((ls, l) => ls + (l.durationMin || 0), 0) || 0,
      0,
    ) || 0
  )
})

courseSchema.index({ title: 'text', description: 'text', tags: 'text' })
courseSchema.index({ category: 1, status: 1 })
courseSchema.index({ createdAt: -1 })

courseSchema.methods.toCardJSON = function toCardJSON() {
  return {
    id: this._id,
    title: this.title,
    subtitle: this.subtitle,
    category: this.category,
    level: this.level,
    price: this.price,
    thumbnailUrl: this.thumbnailUrl,
    avgRating: Math.round((this.avgRating || 0) * 10) / 10,
    numReviews: this.numReviews,
    numStudents: this.numStudents,
    totalLessons: this.totalLessons,
    totalMinutes: this.totalMinutes,
    status: this.status,
    instructor: this.instructor?.toPublicJSON
      ? { id: this.instructor._id, name: this.instructor.name }
      : { id: this.instructor, name: 'Unknown' },
    createdAt: this.createdAt,
  }
}

export const Course = mongoose.model('Course', courseSchema)
