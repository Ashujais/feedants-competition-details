import { Router } from 'express';
import { z } from 'zod';
import {
  getCompetition,
  getContent,
  getRewards,
  getState,
  getWinners,
  register,
  submit,
} from '../controllers/competitionController.js';
import { validate } from '../middleware/validate.js';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid MongoDB id');
const registrationSchema = z.object({ userId: objectId });
const submissionSchema = z.object({
  userId: objectId,
  title: z.string().trim().min(2).max(120),
  mediaUrl: z.string().url().max(1000),
});

export const competitionRouter = Router();
competitionRouter.get('/:id', getCompetition);
competitionRouter.get('/:id/state', getState);
competitionRouter.get('/:id/winners', getWinners);
competitionRouter.get('/:id/rewards', getRewards);
competitionRouter.get('/:id/content', getContent);
competitionRouter.post('/:id/register', validate(registrationSchema), register);
competitionRouter.post('/:id/submission', validate(submissionSchema), submit);
