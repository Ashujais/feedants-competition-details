import { Competition } from '../models/Competition.js';
import { Participation } from '../models/Participation.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { getLifecycleFlags } from '../utils/lifecycle.js';

const isDuplicateKey = (error) => error?.code === 11000;

export async function registerForCompetition(
  competitionId,
  userId,
  { CompetitionModel = Competition, ParticipationModel = Participation, UserModel = User, at = new Date() } = {},
) {
  const [competition, user] = await Promise.all([
    CompetitionModel.findById(competitionId),
    UserModel.findById(userId),
  ]);
  if (!competition) throw new AppError(404, 'COMPETITION_NOT_FOUND', 'Competition not found');
  if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
  if (!competition.isPublished) throw new AppError(409, 'COMPETITION_UNAVAILABLE', 'Competition is unavailable');
  const { registrationOpen, lifecycle } = getLifecycleFlags(competition, at);
  if (!registrationOpen) {
    throw new AppError(409, 'REGISTRATION_CLOSED', `Registration is unavailable while competition is ${lifecycle}`);
  }
  const existing = await ParticipationModel.findOne({ competitionId, userId });
  if (existing) throw new AppError(409, 'ALREADY_REGISTERED', 'User is already registered');

  // Capacity is represented by uniquely indexed slots. Concurrent requests
  // cannot claim the same slot, and the user index prevents double booking.
  const max = competition.maxParticipants;
  const start = Math.floor(Math.random() * max);
  for (let offset = 0; offset < max; offset += 1) {
    const slotNumber = (start + offset) % max;
    try {
      return await ParticipationModel.create({ competitionId, userId, slotNumber, status: 'REGISTERED' });
    } catch (error) {
      if (!isDuplicateKey(error)) throw error;
      const duplicateUser = await ParticipationModel.findOne({ competitionId, userId });
      if (duplicateUser) throw new AppError(409, 'ALREADY_REGISTERED', 'User is already registered');
    }
  }
  throw new AppError(409, 'COMPETITION_FULL', 'No participation spots remain');
}
