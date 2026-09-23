import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    competitionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Competition', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    mediaUrl: { type: String, required: true, trim: true },
    status: { type: String, enum: ['SUBMITTED'], default: 'SUBMITTED' },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

submissionSchema.index({ competitionId: 1, userId: 1 }, { unique: true });
export const Submission = mongoose.model('Submission', submissionSchema);
