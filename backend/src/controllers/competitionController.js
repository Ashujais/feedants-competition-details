import { getCompetitionDetails, findCompetition } from '../services/competitionService.js';
import { registerForCompetition } from '../services/registrationService.js';
import { createSubmission } from '../services/submissionService.js';

export async function getCompetition(req, res) {
  const data = await getCompetitionDetails(req.params.id, req.query.userId);
  res.json({ data });
}

export async function getState(req, res) {
  const data = await getCompetitionDetails(req.params.id, req.query.userId);
  res.json({
    data: {
      lifecycle: data.lifecycle,
      availability: data.availability,
      userState: data.userState,
      serverTime: data.serverTime,
    },
  });
}

export async function getWinners(req, res) {
  const competition = await findCompetition(req.params.id);
  res.json({ data: competition.previousWinners ?? [] });
}

export async function getRewards(req, res) {
  const competition = await findCompetition(req.params.id);
  res.json({ data: competition.rewards ?? [] });
}

export async function getContent(req, res) {
  const competition = await findCompetition(req.params.id);
  res.json({ data: competition.content });
}

export async function register(req, res) {
  const competition = await findCompetition(req.params.id);
  const participation = await registerForCompetition(competition._id, req.body.userId);
  const data = await getCompetitionDetails(competition._id.toString(), req.body.userId);
  res.status(201).json({ data: { participation, state: data.userState, availability: data.availability } });
}

export async function submit(req, res) {
  const competition = await findCompetition(req.params.id);
  const submission = await createSubmission(competition._id, req.body.userId, {
    title: req.body.title,
    mediaUrl: req.body.mediaUrl,
  });
  res.status(201).json({ data: submission });
}
