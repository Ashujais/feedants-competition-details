import test from 'node:test';
import assert from 'node:assert/strict';
import { registerForCompetition } from '../src/services/registrationService.js';

function fixtures({ capacity = 3, open = true } = {}) {
  const competition = {
    _id: 'competition',
    isPublished: true,
    maxParticipants: capacity,
    registrationStart: open ? new Date(Date.now() - 1000) : new Date(Date.now() + 10000),
    registrationEnd: new Date(Date.now() + 20000),
    submissionStart: new Date(Date.now() + 30000),
    submissionEnd: new Date(Date.now() + 40000),
    resultDate: new Date(Date.now() + 50000),
  };
  const records = [];
  const ParticipationModel = {
    async findOne({ userId }) { return records.find((record) => record.userId === userId); },
    async create(record) {
      await new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random() * 4)));
      if (records.some((item) => item.slotNumber === record.slotNumber || item.userId === record.userId)) {
        const error = new Error('duplicate');
        error.code = 11000;
        throw error;
      }
      records.push(record);
      return record;
    },
  };
  return {
    records,
    deps: {
      CompetitionModel: { async findById() { return competition; } },
      UserModel: { async findById(id) { return { _id: id }; } },
      ParticipationModel,
    },
  };
}

test('valid registration succeeds and duplicate is rejected', async () => {
  const { deps } = fixtures();
  await registerForCompetition('competition', 'user-1', deps);
  await assert.rejects(() => registerForCompetition('competition', 'user-1', deps), { code: 'ALREADY_REGISTERED' });
});

test('registration is rejected outside the registration window', async () => {
  const { deps } = fixtures({ open: false });
  await assert.rejects(() => registerForCompetition('competition', 'user-1', deps), { code: 'REGISTRATION_CLOSED' });
});

test('concurrent registrations never exceed capacity', async () => {
  const { deps, records } = fixtures({ capacity: 3 });
  const attempts = Array.from({ length: 20 }, (_, index) =>
    registerForCompetition('competition', `user-${index}`, deps),
  );
  const results = await Promise.allSettled(attempts);
  assert.equal(results.filter((result) => result.status === 'fulfilled').length, 3);
  assert.equal(records.length, 3);
  assert.equal(new Set(records.map((record) => record.slotNumber)).size, 3);
  assert.ok(results.filter((result) => result.status === 'rejected').every((result) => result.reason.code === 'COMPETITION_FULL'));
});
