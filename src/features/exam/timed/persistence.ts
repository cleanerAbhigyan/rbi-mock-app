import { persistedTimedAttemptSchema } from '../../../schemas/timed-attempt';
import type { TimedAttempt } from './engine';
import {
  buildSchedule,
  questionSnapshots,
  reconcileTimedAttempt,
} from './engine';
import type { TimedContext } from './profile';

export const TIMED_STORAGE_KEY = 'rbi-mock-app:timed-practice:v1';
export interface AttemptStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** Explicit DTO: unsaved draft and solutions can never leak into persisted responses. */
export function serializeTimedAttempt(attempt: TimedAttempt): string {
  return JSON.stringify({
    ...attempt,
    session: {
      profileId: attempt.session.profileId,
      activeQuestionId: attempt.session.activeQuestionId,
      visitedQuestionIds: attempt.session.visitedQuestionIds,
      savedResponses: attempt.session.savedResponses,
      reviewFlags: attempt.session.reviewFlags,
    },
  });
}

export function restoreTimedAttempt(
  raw: string,
  context: TimedContext,
  now: number,
): TimedAttempt {
  const data = persistedTimedAttemptSchema.parse(JSON.parse(raw));
  const requireValid = (condition: boolean) => {
    if (!condition)
      throw new Error('Saved timed practice is inconsistent or outdated.');
  };
  requireValid(
    JSON.stringify(data.profileSnapshot) === JSON.stringify(context.profile),
  );
  requireValid(
    JSON.stringify(data.questionSnapshots) ===
      JSON.stringify(questionSnapshots(context)),
  );
  requireValid(
    JSON.stringify(data.schedule) ===
      JSON.stringify(buildSchedule(data.startedAtMs, context)),
  );
  requireValid(
    data.lastObservedAtMs >= data.startedAtMs &&
      data.session.profileId === context.profile.id,
  );
  const finalDeadline = data.schedule.at(-1)!.deadlineAtMs;
  const expectedIndex = Math.min(
    data.schedule.length - 1,
    data.schedule.filter((s) => s.deadlineAtMs <= data.lastObservedAtMs).length,
  );
  requireValid(data.activeSectionIndex === expectedIndex);
  if (data.status === 'in-progress') {
    requireValid(
      data.submittedAtMs === null &&
        data.submissionReason === null &&
        data.lastObservedAtMs < finalDeadline,
    );
  } else {
    requireValid(data.submittedAtMs !== null && data.submissionReason !== null);
    requireValid(
      data.submittedAtMs! >= data.startedAtMs &&
        data.submittedAtMs! <= data.lastObservedAtMs,
    );
    requireValid(
      data.submissionReason === 'timeout'
        ? data.submittedAtMs === finalDeadline
        : data.submittedAtMs! < finalDeadline,
    );
    // After manual submission, observation time is frozen at submission time.
    if (data.submissionReason === 'manual')
      requireValid(data.lastObservedAtMs === data.submittedAtMs);
  }
  const byId = new Map(data.questionSnapshots.map((q) => [q.id, q]));
  const sectionIndex = (id: string) =>
    context.profile.sections.findIndex((section) =>
      section.questionIds.includes(id),
    );
  const visited = data.session.visitedQuestionIds;
  requireValid(
    new Set(visited).size === visited.length &&
      visited.includes(data.session.activeQuestionId),
  );
  for (const id of visited)
    requireValid(byId.has(id) && sectionIndex(id) <= data.activeSectionIndex);
  if (data.status === 'in-progress')
    requireValid(
      sectionIndex(data.session.activeQuestionId) === data.activeSectionIndex,
    );
  for (const [id, response] of Object.entries(data.session.savedResponses)) {
    const question = byId.get(id);
    requireValid(!!question && visited.includes(id));
    requireValid(
      response.questionId === id &&
        response.questionRevision === question!.revision,
    );
    requireValid(
      question!.options.some(
        (option) => option.id === response.selectedOptionId,
      ),
    );
    const savedAt = Date.parse(response.savedAt);
    const window = data.schedule[sectionIndex(id)]!;
    requireValid(
      savedAt >= window.startsAtMs &&
        savedAt < window.deadlineAtMs &&
        savedAt <= data.lastObservedAtMs,
    );
    if (data.submittedAtMs !== null)
      requireValid(savedAt <= data.submittedAtMs);
  }
  for (const id of Object.keys(data.session.reviewFlags))
    requireValid(byId.has(id) && visited.includes(id));
  const attempt: TimedAttempt = {
    ...data,
    session: {
      ...data.session,
      draft: {
        questionId: data.session.activeQuestionId,
        selectedOptionId:
          data.session.savedResponses[data.session.activeQuestionId]
            ?.selectedOptionId ?? null,
      },
    },
  };
  return reconcileTimedAttempt(attempt, now);
}
