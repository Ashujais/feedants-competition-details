export const Lifecycle = Object.freeze({
  UPCOMING: 'UPCOMING',
  REGISTRATION_OPEN: 'REGISTRATION_OPEN',
  REGISTRATION_CLOSED: 'REGISTRATION_CLOSED',
  SUBMISSION_OPEN: 'SUBMISSION_OPEN',
  SUBMISSION_CLOSED: 'SUBMISSION_CLOSED',
  RESULTS_PENDING: 'RESULTS_PENDING',
  COMPLETED: 'COMPLETED',
});

export function deriveCompetitionState(competition, at = new Date()) {
  const now = at.getTime();
  const registrationStart = new Date(competition.registrationStart).getTime();
  const registrationEnd = new Date(competition.registrationEnd).getTime();
  const submissionStart = new Date(competition.submissionStart).getTime();
  const submissionEnd = new Date(competition.submissionEnd).getTime();
  const resultDate = new Date(competition.resultDate).getTime();
  if (now < registrationStart) return Lifecycle.UPCOMING;
  if (now <= registrationEnd) return Lifecycle.REGISTRATION_OPEN;
  if (now < submissionStart) return Lifecycle.REGISTRATION_CLOSED;
  if (now <= submissionEnd) return Lifecycle.SUBMISSION_OPEN;
  if (now < resultDate) return Lifecycle.RESULTS_PENDING;
  return Lifecycle.COMPLETED;
}

export function getLifecycleFlags(competition, at = new Date()) {
  const now = at.getTime();
  return {
    lifecycle: deriveCompetitionState(competition, at),
    registrationOpen: now >= new Date(competition.registrationStart).getTime() && now <= new Date(competition.registrationEnd).getTime(),
    submissionOpen: now >= new Date(competition.submissionStart).getTime() && now <= new Date(competition.submissionEnd).getTime(),
  };
}
