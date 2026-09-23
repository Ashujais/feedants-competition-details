import mongoose from 'mongoose';
import { Competition } from '../models/Competition.js';
import { Participation } from '../models/Participation.js';
import { Submission } from '../models/Submission.js';
import { AppError } from '../utils/AppError.js';
import { getLifecycleFlags } from '../utils/lifecycle.js';

export async function findCompetition(identifier) {
  const query = mongoose.isValidObjectId(identifier) ? { _id: identifier } : { slug: identifier };
  const competition = await Competition.findOne({ ...query, isPublished: true }).lean();
  if (!competition) throw new AppError(404, 'COMPETITION_NOT_FOUND', 'Competition not found');
  return competition;
}

export async function getCompetitionDetails(identifier, userId) {
  const competition = await findCompetition(identifier);
  const validUser = userId && mongoose.isValidObjectId(userId);
  const [registeredCount, participation, submission] = await Promise.all([
    Participation.countDocuments({ competitionId: competition._id, status: 'REGISTERED' }),
    validUser ? Participation.findOne({ competitionId: competition._id, userId, status: 'REGISTERED' }).lean() : null,
    validUser ? Submission.findOne({ competitionId: competition._id, userId }).lean() : null,
  ]);
  const flags = getLifecycleFlags(competition);
  const remainingSpots = Math.max(competition.maxParticipants - registeredCount, 0);
  return {
    ...competition,
    lifecycle: flags.lifecycle,
    availability: { registeredCount, remainingSpots, isFull: remainingSpots === 0 },
    userState: {
      isRegistered: Boolean(participation),
      participationStatus: participation?.status ?? 'NOT_REGISTERED',
      submissionStatus: submission ? 'SUBMITTED' : 'NOT_SUBMITTED',
      registrationAllowed: flags.registrationOpen && remainingSpots > 0 && !participation,
      submissionAllowed: flags.submissionOpen && Boolean(participation) && !submission,
    },
    serverTime: new Date().toISOString(),
  };
}
