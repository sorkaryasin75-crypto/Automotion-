import { isValidTransition } from '../src/tasks/task-state.js';

describe('Task State Machine Tests', () => {
  test('allows valid state transitions', () => {
    expect(isValidTransition('REQUESTING', 'ASSIGNED')).toBe(true);
    expect(isValidTransition('ASSIGNED', 'DISPLAYED')).toBe(true);
    expect(isValidTransition('WAITING_FOR_HUMAN', 'ANSWER_SUBMITTED')).toBe(true);
    expect(isValidTransition('VALIDATING', 'SUCCESS')).toBe(true);
  });

  test('rejects invalid state transitions', () => {
    expect(isValidTransition('SUCCESS', 'REQUESTING')).toBe(false);
    expect(isValidTransition('REQUESTING', 'SUCCESS')).toBe(false);
    expect(isValidTransition('SKIPPED', 'ASSIGNED')).toBe(false);
  });
});
