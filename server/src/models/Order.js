import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    amount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending', index: true },
    provider: { type: String, default: 'mock', enum: ['mock', 'stripe'] },
    providerRef: { type: String, default: '' },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true },
)

orderSchema.index({ student: 1, createdAt: -1 })

export const Order = mongoose.model('Order', orderSchema)
