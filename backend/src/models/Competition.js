import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema(
  { name: String, position: String, imageUrl: String, videoUrl: String },
  { _id: false },
);
const rewardSchema = new mongoose.Schema(
  { position: { type: Number, required: true }, label: String, amount: { type: Number, min: 0, required: true } },
  { _id: false },
);
const competitionSchema = new mongoose.Schema(
  {
    slug: { type: String, unique: true, required: true, index: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    badges: [String],
    description: { type: String, required: true },
    prizePool: { type: Number, min: 0, required: true },
    entryFee: { type: Number, min: 0, required: true },
    maxParticipants: { type: Number, min: 1, required: true },
    registrationStart: { type: Date, required: true, index: true },
    registrationEnd: { type: Date, required: true, index: true },
    submissionStart: { type: Date, required: true },
    submissionEnd: { type: Date, required: true },
    resultDate: { type: Date, required: true },
    certificateText: String,
    judge: { name: String, title: String, experience: String, imageUrl: String, videoUrl: String },
    previousWinners: [mediaSchema],
    content: { about: String, judgingParameters: [String], rules: [String], eligibility: [String] },
    rewards: [rewardSchema],
    referral: { url: String, earningText: String },
    paymentInfo: { prizeDelivery: String, refundPolicy: String, provider: String, explainerVideoUrl: String },
    reviews: [{ name: String, quote: String, rating: Number }],
    isPublished: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

competitionSchema.pre('validate', function validateDates() {
  const dates = [this.registrationStart, this.registrationEnd, this.submissionStart, this.submissionEnd, this.resultDate];
  if (dates.some((date) => !date)) return;
  if (this.registrationStart >= this.registrationEnd) this.invalidate('registrationEnd', 'Must be after registrationStart');
  if (this.submissionStart >= this.submissionEnd) this.invalidate('submissionEnd', 'Must be after submissionStart');
  if (this.submissionEnd >= this.resultDate) this.invalidate('resultDate', 'Must be after submissionEnd');
});

export const Competition = mongoose.model('Competition', competitionSchema);
