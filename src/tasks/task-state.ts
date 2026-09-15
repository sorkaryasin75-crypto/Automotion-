export type TaskState =
  | 'REQUESTING'
  | 'ASSIGNED'
  | 'DISPLAYED'
  | 'WAITING_FOR_HUMAN'
  | 'ANSWER_SUBMITTED'
  | 'VALIDATING'
  | 'SUCCESS'
  | 'INCORRECT'
  | 'SKIPPED'
  | 'EXPIRED'
  | 'FAILED';

const allowedTransitions: Record<TaskState, TaskState[]> = {
  REQUESTING: ['ASSIGNED', 'FAILED'],
  ASSIGNED: ['DISPLAYED', 'EXPIRED', 'SKIPPED'],
  DISPLAYED: ['WAITING_FOR_HUMAN', 'EXPIRED', 'SKIPPED'],
  WAITING_FOR_HUMAN: ['ANSWER_SUBMITTED', 'EXPIRED', 'SKIPPED'],
  ANSWER_SUBMITTED: ['VALIDATING', 'EXPIRED', 'FAILED'],
  VALIDATING: ['SUCCESS', 'INCORRECT', 'FAILED'],
  SUCCESS: [],
  INCORRECT: ['WAITING_FOR_HUMAN', 'SKIPPED', 'EXPIRED'],
  SKIPPED: [],
  EXPIRED: [],
  FAILED: [],
};

export function isValidTransition(currentState: TaskState, nextState: TaskState): boolean {
  const allowed = allowedTransitions[currentState];
  return allowed ? allowed.includes(nextState) : false;
}
