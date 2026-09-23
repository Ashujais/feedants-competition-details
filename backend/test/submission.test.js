import test from 'node:test';
import assert from 'node:assert/strict';
import { createSubmission } from '../src/services/submissionService.js';

const now = new Date('2026-02-10T12:00:00Z');
const competition = {
  registrationStart: new Date('2026-02-01T00:00:00Z'),
  registrationEnd: new Date('2026-02-09T00:00:00Z'),
  submissionStart: new Date('2026-02-10T00:00:00Z'),
  submissionEnd: new Date('2026-02-11T00:00:00Z'),
  resultDate: new Date('2026-02-12T00:00:00Z'),
};
const payload = { title: 'Performance', mediaUrl: 'https://example.com/video' };

function dependencies({ registered = true, start = competition.submissionStart } = {}) {
  const mutableCompetition = { ...competition, submissionStart: start };
  const stored = [];
  return {
    stored,
    deps: {
      CompetitionModel: { async findById() { return mutableCompetition; } },
      UserModel: { async findById() { return { _id: 'user' }; } },
      ParticipationModel: {
        async findOne() { return registered ? { _id: 'participation' } : null; },
        async updateOne() {},
      },
      SubmissionModel: {
        async create(value) { stored.push(value); return value; },
      },
    },
  };
}

test('submission requires registration', async () => {
  const { deps } = dependencies({ registered: false });
  await assert.rejects(() => createSubmission('competition', 'user', payload, now, deps), { code: 'REGISTRATION_REQUIRED' });
});

test('submission is rejected outside its window', async () => {
  const { deps } = dependencies({ start: new Date('2026-02-11T12:00:00Z') });
  await assert.rejects(() => createSubmission('competition', 'user', payload, now, deps), { code: 'SUBMISSION_CLOSED' });
});

test('registered user can submit inside the window', async () => {
  const { deps, stored } = dependencies();
  await createSubmission('competition', 'user', payload, now, deps);
  assert.equal(stored.length, 1);
  assert.equal(stored[0].title, payload.title);
});
