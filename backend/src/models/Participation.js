import mongoose from 'mongoose';

const participationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    competitionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Competition', required: true },
    slotNumber: { type: Number, min: 0, required: true },
    status: { type: String, enum: ['REGISTERED', 'CANCELLED'], default: 'REGISTERED' },
    paymentStatus: { type: String, enum: ['DEMO_PAID', 'PENDING', 'REFUNDED'], default: 'DEMO_PAID' },
    registeredAt: { type: Date, default: Date.now },
    submissionStatus: { type: String, enum: ['NOT_SUBMITTED', 'SUBMITTED'], default: 'NOT_SUBMITTED' },
  },
  { timestamps: true },
);

participationSchema.index({ competitionId: 1, userId: 1 }, { unique: true });
participationSchema.index({ competitionId: 1, slotNumber: 1 }, { unique: true });
participationSchema.index({ competitionId: 1, status: 1 });
export const Participation = mongoose.model('Participation', participationSchema);
