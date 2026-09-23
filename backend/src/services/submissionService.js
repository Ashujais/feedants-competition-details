import { Competition } from '../models/Competition.js';
import { Participation } from '../models/Participation.js';
import { Submission } from '../models/Submission.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { getLifecycleFlags } from '../utils/lifecycle.js';

export async function createSubmission(
  competitionId,
  userId,
  payload,
  at = new Date(),
  { CompetitionModel = Competition, ParticipationModel = Participation, SubmissionModel = Submission, UserModel = User } = {},
) {
  const [competition, user, participation] = await Promise.all([
    CompetitionModel.findById(competitionId),
    UserModel.findById(userId),
    ParticipationModel.findOne({ competitionId, userId, status: 'REGISTERED' }),
  ]);
  if (!competition) throw new AppError(404, 'COMPETITION_NOT_FOUND', 'Competition not found');
  if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
  if (!participation) throw new AppError(403, 'REGISTRATION_REQUIRED', 'Register before submitting');
  if (!getLifecycleFlags(competition, at).submissionOpen) {
    throw new AppError(409, 'SUBMISSION_CLOSED', 'Submissions are not open');
  }
  try {
    const submission = await SubmissionModel.create({ competitionId, userId, ...payload });
    await ParticipationModel.updateOne({ _id: participation._id }, { submissionStatus: 'SUBMITTED' });
    return submission;
  } catch (error) {
    if (error?.code === 11000) throw new AppError(409, 'ALREADY_SUBMITTED', 'A submission already exists');
    throw error;
  }
}
