import test from 'node:test';
import assert from 'node:assert/strict';
import { deriveCompetitionState, getLifecycleFlags, Lifecycle } from '../src/utils/lifecycle.js';

const base = {
  registrationStart: '2026-01-02T00:00:00.000Z',
  registrationEnd: '2026-01-03T00:00:00.000Z',
  submissionStart: '2026-01-04T00:00:00.000Z',
  submissionEnd: '2026-01-05T00:00:00.000Z',
  resultDate: '2026-01-06T00:00:00.000Z',
};

test('derives every lifecycle boundary from stored dates', () => {
  assert.equal(deriveCompetitionState(base, new Date('2026-01-01T00:00:00Z')), Lifecycle.UPCOMING);
  assert.equal(deriveCompetitionState(base, new Date('2026-01-02T12:00:00Z')), Lifecycle.REGISTRATION_OPEN);
  assert.equal(deriveCompetitionState(base, new Date('2026-01-03T12:00:00Z')), Lifecycle.REGISTRATION_CLOSED);
  assert.equal(deriveCompetitionState(base, new Date('2026-01-04T12:00:00Z')), Lifecycle.SUBMISSION_OPEN);
  assert.equal(deriveCompetitionState(base, new Date('2026-01-05T12:00:00Z')), Lifecycle.RESULTS_PENDING);
  assert.equal(deriveCompetitionState(base, new Date('2026-01-06T00:00:00Z')), Lifecycle.COMPLETED);
});

test('submission and registration windows are independent flags', () => {
  const overlapping = { ...base, submissionStart: '2026-01-02T06:00:00Z' };
  const flags = getLifecycleFlags(overlapping, new Date('2026-01-02T12:00:00Z'));
  assert.equal(flags.registrationOpen, true);
  assert.equal(flags.submissionOpen, true);
});
