import { startDemoSession, transitionDemoSession } from '../demo-session';
import type { DemoAction, DemoCommand, DemoSession } from '../demo-session';
import type { PersistedTimedAttempt } from '../../../schemas/timed-attempt';
import type { TimedContext } from './profile';

export type TimedAttempt = Omit<PersistedTimedAttempt, 'session'> & {
  session: DemoSession;
};
export type TimedCommand =
  (DemoCommand & { editorQuestionId?: string }) | { type: 'submit' };

export function buildSchedule(startedAtMs: number, context: TimedContext) {
  let startsAtMs = startedAtMs;
  return context.profile.sections.map((section) => {
    const deadlineAtMs = startsAtMs + section.durationSeconds * 1000;
    validClock(deadlineAtMs);
    const entry = { sectionId: section.id, startsAtMs, deadlineAtMs };
    startsAtMs = deadlineAtMs;
    return entry;
  });
}

export function questionSnapshots(
  context: TimedContext,
): PersistedTimedAttempt['questionSnapshots'] {
  return context.profile.sections.flatMap((section) =>
    section.questionIds.map((id) => {
      const question = context.questions.find((q) => q.id === id);
      if (
        !question ||
        question.marks === null ||
        question.negativeMarks === null
      )
        throw new Error('Invalid timed question set.');
      return {
        id,
        revision: question.revision,
        sectionId: section.id,
        text: question.text,
        options: structuredClone(question.options),
        marks: question.marks,
        negativeMarks: question.negativeMarks,
      };
    }),
  );
}

function validClock(now: number) {
  if (!Number.isSafeInteger(now) || now < 0 || now > 8_640_000_000_000_000)
    throw new Error('Invalid application clock.');
  return now;
}

export function startTimedAttempt(
  id: string,
  context: TimedContext,
  now: number,
): TimedAttempt {
  validClock(now);
  const snapshots = questionSnapshots(context);
  return {
    schemaVersion: '1.0',
    id,
    profileSnapshot: structuredClone(context.profile),
    questionSnapshots: snapshots,
    startedAtMs: now,
    lastObservedAtMs: now,
    schedule: buildSchedule(now, context),
    activeSectionIndex: 0,
    status: 'in-progress',
    submittedAtMs: null,
    submissionReason: null,
    session: startDemoSession(
      context.profile.id,
      snapshots.map((snapshot) =>
        context.questions.find((q) => q.id === snapshot.id)!,
      ),
    ),
  };
}

/** Half-open section windows: at deadline, reconcile expiry BEFORE applying a command. */
export function reconcileTimedAttempt(
  attempt: TimedAttempt,
  now: number,
): TimedAttempt {
  if (attempt.status === 'submitted') return attempt;
  const observed = Math.max(attempt.lastObservedAtMs, validClock(now));
  const finalDeadline = attempt.schedule.at(-1)!.deadlineAtMs;
  if (observed >= finalDeadline) {
    return {
      ...attempt,
      status: 'submitted',
      submittedAtMs: finalDeadline,
      submissionReason: 'timeout',
      lastObservedAtMs: observed,
      activeSectionIndex: attempt.schedule.length - 1,
      session: {
        ...attempt.session,
        draft: {
          questionId: attempt.session.activeQuestionId,
          selectedOptionId:
            attempt.session.savedResponses[attempt.session.activeQuestionId]
              ?.selectedOptionId ?? null,
        },
      },
    };
  }
  const index = attempt.schedule.findIndex(
    (section) => observed < section.deadlineAtMs,
  );
  let session = attempt.session;
  if (index !== attempt.activeSectionIndex) {
    const id = attempt.profileSnapshot.sections[index]!.questionIds[0]!;
    session = {
      ...session,
      activeQuestionId: id,
      visitedQuestionIds: session.visitedQuestionIds.includes(id)
        ? session.visitedQuestionIds
        : [...session.visitedQuestionIds, id],
      draft: {
        questionId: id,
        selectedOptionId: session.savedResponses[id]?.selectedOptionId ?? null,
      },
    };
  }
  if (observed === attempt.lastObservedAtMs && session === attempt.session)
    return attempt;
  return {
    ...attempt,
    session,
    activeSectionIndex: index,
    lastObservedAtMs: observed,
  };
}

export function remainingSectionMs(attempt: TimedAttempt, now: number): number {
  if (attempt.status === 'submitted') return 0;
  return Math.max(
    0,
    attempt.schedule[attempt.activeSectionIndex]!.deadlineAtMs -
      Math.max(now, attempt.lastObservedAtMs),
  );
}

/** Timed commands can never edit a past/future section or a finalized attempt. */
export function transitionTimedAttempt(
  before: TimedAttempt,
  command: TimedCommand,
  now: number,
  context: TimedContext,
): TimedAttempt {
  const attempt = reconcileTimedAttempt(before, now);
  if (attempt.status === 'submitted') return attempt;
  if (command.type === 'submit') {
    const session = transitionDemoSession(
      attempt.session,
      { type: 'discard-draft' },
      context.questions,
    );
    return {
      ...attempt,
      session,
      status: 'submitted',
      submittedAtMs: attempt.lastObservedAtMs,
      submissionReason: 'manual',
    };
  }
  // An event aimed at an expired editor must not act on the newly opened section.
  if (attempt.activeSectionIndex !== before.activeSectionIndex) return attempt;
  if (
    command.editorQuestionId &&
    command.editorQuestionId !== attempt.session.activeQuestionId
  )
    return attempt;
  const section = attempt.profileSnapshot.sections[attempt.activeSectionIndex]!;
  if (
    command.type === 'navigate' &&
    !section.questionIds.includes(command.questionId)
  )
    return attempt;
  const questions = section.questionIds.map((id) =>
    context.questions.find((q) => q.id === id)!,
  );
  const action: DemoAction =
    command.type === 'save-and-next' || command.type === 'review-and-next'
      ? {
          ...command,
          savedAt: new Date(attempt.lastObservedAtMs).toISOString(),
        }
      : command;
  const session = transitionDemoSession(attempt.session, action, questions);
  return session === attempt.session ? attempt : { ...attempt, session };
}
