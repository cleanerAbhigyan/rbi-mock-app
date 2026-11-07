import { describe, expect, it } from 'vitest';
import { timedContext } from '../src/features/exam/timed/profile';
import {
  reconcileTimedAttempt,
  remainingSectionMs,
  startTimedAttempt,
  transitionTimedAttempt,
} from '../src/features/exam/timed/engine';
import type {
  TimedAttempt,
  TimedCommand,
} from '../src/features/exam/timed/engine';
import {
  restoreTimedAttempt,
  serializeTimedAttempt,
} from '../src/features/exam/timed/persistence';
import { scoreSubmittedAttempt } from '../src/features/exam/timed/scoring';
import {
  demoScoringRepository,
  createDemoScoringRepository,
} from '../src/data/demo/demo-scoring-repository';
import { runtimeDemoRecords } from '../src/data/demo/demo-questions';
import { deriveQuestionStatus } from '../src/features/exam/demo-session';

const context = structuredClone(timedContext);
context.profile.sections.forEach((s) => {
  s.durationSeconds = 10;
});
const start = () => startTimedAttempt('test-timed-attempt', context, 1000);
const firstId = context.questions[0]!.id;
const secondId = context.questions[1]!.id;
const act = (attempt: TimedAttempt, command: TimedCommand, now = 2000) =>
  transitionTimedAttempt(attempt, command, now, context);
const keys = demoScoringRepository.listScoringRecords();

describe('absolute deadline schedule and section locks', () => {
  it('starts once, visits the first question, and builds cumulative per-section deadlines', () => {
    const a = start();
    expect(a.startedAtMs).toBe(1000);
    expect(a.schedule.map((s) => s.deadlineAtMs)).toEqual([
      11000, 21000, 31000, 41000,
    ]);
    expect(a.session.visitedQuestionIds).toEqual([firstId]);
    expect(a.session.draft.selectedOptionId).toBeNull();
    expect(remainingSectionMs(a, 1000)).toBe(10000);
    expect(remainingSectionMs(a, 10999)).toBe(1);
  });

  it('never resets time on reconciliation, delayed ticks, or a backwards observed clock', () => {
    const a = reconcileTimedAttempt(start(), 5000);
    expect(remainingSectionMs(a, 5000)).toBe(6000);
    expect(remainingSectionMs(a, 2000)).toBe(6000);
    expect(reconcileTimedAttempt(a, 2000)).toBe(a);
    expect(reconcileTimedAttempt(a, 5000)).toBe(a);
    expect(a.schedule).toEqual(start().schedule);
    expect(reconcileTimedAttempt(start(), 26900).activeSectionIndex).toBe(2);
  });

  it('follows profile order even when provider question order is different', () => {
    const shuffled = {
      ...context,
      questions: [...context.questions].reverse(),
    };
    const a = startTimedAttempt('shuffled', shuffled, 1000);
    expect(a.session.activeQuestionId).toBe(firstId);
    expect(
      transitionTimedAttempt(a, { type: 'move', direction: 1 }, 2000, shuffled)
        .session.activeQuestionId,
    ).toBe(secondId);
  });

  it('allows only the active section and clamps Save/Next at its final question', () => {
    const a = act(start(), {
      type: 'navigate',
      questionId: context.questions[3]!.id,
    });
    expect(a.session.activeQuestionId).toBe(firstId);
    const lastInSection = act(a, {
      type: 'navigate',
      questionId: context.questions[2]!.id,
    });
    expect(
      act(lastInSection, { type: 'move', direction: 1 }).session
        .activeQuestionId,
    ).toBe(context.questions[2]!.id);
    expect(
      act(lastInSection, { type: 'save-and-next' }).session.activeQuestionId,
    ).toBe(context.questions[2]!.id);
    expect(
      act(start(), { type: 'move', direction: -1 }).session.activeQuestionId,
    ).toBe(firstId);
  });

  it('reconciles the exact boundary BEFORE a pending save and discards the expired draft', () => {
    const draft = act(start(), { type: 'select', optionId: 'a' }, 10999);
    const advanced = act(draft, { type: 'save-and-next' }, 11000);
    expect(advanced.activeSectionIndex).toBe(1);
    expect(advanced.session.activeQuestionId).toBe(context.questions[3]!.id);
    expect(advanced.session.savedResponses).toEqual({});
    expect(advanced.session.draft.selectedOptionId).toBeNull();
    const past = act(
      advanced,
      { type: 'navigate', questionId: firstId },
      12000,
    );
    expect(past.session.activeQuestionId).toBe(context.questions[3]!.id);
  });

  it.each<TimedCommand>([
    { type: 'select', optionId: 'a' },
    { type: 'clear' },
    { type: 'remove-review' },
    { type: 'review-and-next' },
    { type: 'navigate', questionId: firstId },
    { type: 'move', direction: -1 },
  ])('rejects expired-editor mutations: $type', (command) => {
    const saved = act(act(start(), { type: 'select', optionId: 'a' }), {
      type: 'review-and-next',
    });
    const late = act(saved, command, 11000);
    expect(late.session.savedResponses).toEqual(saved.session.savedResponses);
    expect(late.session.reviewFlags).toEqual(saved.session.reviewFlags);
    expect(late.session.activeQuestionId).toBe(context.questions[3]!.id);
  });

  it('skips multiple elapsed windows without granting new time or inventing visits', () => {
    const a = reconcileTimedAttempt(start(), 34000);
    expect(a.activeSectionIndex).toBe(3);
    expect(a.session.visitedQuestionIds).toEqual([
      firstId,
      context.questions[9]!.id,
    ]);
    expect(remainingSectionMs(a, 34000)).toBe(7000);
    expect(a.schedule.at(-1)!.deadlineAtMs).toBe(41000);
  });

  it('ignores stale UI events after a timer tick already advanced the editor', () => {
    const a = reconcileTimedAttempt(start(), 11000);
    const late = act(
      a,
      { type: 'select', optionId: 'a', editorQuestionId: firstId },
      11000,
    );
    expect(late.session.draft.selectedOptionId).toBeNull();
    expect(late.session.activeQuestionId).toBe(context.questions[3]!.id);
  });

  it('preserves draft/saved/review semantics within the active section', () => {
    let a = act(start(), { type: 'select', optionId: 'a' });
    expect(a.session.savedResponses).toEqual({});
    a = act(a, { type: 'review-and-next' });
    expect(deriveQuestionStatus(a.session, firstId)).toBe(
      'answered-and-marked-for-review',
    );
    a = act(a, { type: 'navigate', questionId: firstId });
    a = act(a, { type: 'select', optionId: 'd' });
    a = act(a, { type: 'navigate', questionId: secondId });
    a = act(a, { type: 'navigate', questionId: firstId });
    expect(a.session.draft.selectedOptionId).toBe('a');
    a = act(a, { type: 'clear' });
    expect(a.session.savedResponses[firstId]).toBeUndefined();
    expect(a.session.reviewFlags[firstId]).toBe('marked-for-review');
    a = act(a, { type: 'remove-review' });
    expect(deriveQuestionStatus(a.session, firstId)).toBe('not-answered');
  });
});

describe('final submission and races', () => {
  it('manually freezes committed answers, discards drafts and remains idempotent', () => {
    const draft = act(start(), { type: 'select', optionId: 'a' });
    const submitted = act(draft, { type: 'submit' }, 3000);
    expect(submitted.submissionReason).toBe('manual');
    expect(submitted.submittedAtMs).toBe(3000);
    expect(submitted.session.savedResponses).toEqual({});
    expect(submitted.session.draft.selectedOptionId).toBeNull();
    for (const command of [
      { type: 'submit' },
      { type: 'select', optionId: 'b' },
      { type: 'clear' },
      { type: 'save-and-next' },
      { type: 'review-and-next' },
    ] as TimedCommand[]) {
      expect(act(submitted, command, 999999)).toBe(submitted);
    }
    expect(reconcileTimedAttempt(submitted, 999999)).toBe(submitted);
    expect(remainingSectionMs(submitted, 999999)).toBe(0);
  });

  it.each([41000, 41001, 999999])(
    'automatically finalizes at original deadline after waking at %i',
    (now) => {
      const a = reconcileTimedAttempt(start(), now);
      expect(a.status).toBe('submitted');
      expect(a.submissionReason).toBe('timeout');
      expect(a.submittedAtMs).toBe(41000);
      expect(act(a, { type: 'submit' }, now + 1)).toBe(a);
    },
  );

  it('a save at the final deadline loses to timeout in either event order', () => {
    let draft = reconcileTimedAttempt(start(), 32000);
    draft = act(draft, { type: 'select', optionId: 'b' }, 40999);
    const saveFirst = act(draft, { type: 'save-and-next' }, 41000);
    const tickFirst = act(
      reconcileTimedAttempt(draft, 41000),
      { type: 'save-and-next' },
      41000,
    );
    expect(saveFirst).toEqual(tickFirst);
    expect(saveFirst.session.savedResponses).toEqual({});
    expect(act(draft, { type: 'submit' }, 41000).submissionReason).toBe(
      'timeout',
    );
    expect(
      act(draft, { type: 'save-and-next' }, 40999).session.savedResponses[
        context.questions[9]!.id
      ],
    ).toBeDefined();
  });
});

describe('versioned persistence and recovery', () => {
  it('restores committed choices/flags and drops unsaved edits without resetting deadlines', () => {
    let a = act(act(start(), { type: 'select', optionId: 'a' }), {
      type: 'review-and-next',
    });
    a = act(a, { type: 'navigate', questionId: firstId });
    a = act(a, { type: 'select', optionId: 'd' });
    const raw = serializeTimedAttempt(a);
    expect(JSON.parse(raw).session).not.toHaveProperty('draft');
    const restored = restoreTimedAttempt(raw, context, 7000);
    expect(restored.session.draft.selectedOptionId).toBe('a');
    expect(restored.session.reviewFlags[firstId]).toBe('marked-for-review');
    expect(restored.schedule).toEqual(a.schedule);
    expect(restored.startedAtMs).toBe(1000);
    expect(remainingSectionMs(restored, 7000)).toBe(4000);
  });

  it('does not promote a draft and reconciles several deadlines or final expiry on refresh', () => {
    const raw = serializeTimedAttempt(
      act(start(), { type: 'select', optionId: 'a' }),
    );
    const reopened = restoreTimedAttempt(raw, context, 25000);
    expect(reopened.activeSectionIndex).toBe(2);
    expect(reopened.session.savedResponses).toEqual({});
    expect(reopened.session.draft.selectedOptionId).toBeNull();
    expect(restoreTimedAttempt(raw, context, 999999).submittedAtMs).toBe(41000);
  });

  it('restores the same submitted attempt and result without duplicate scoring records', () => {
    const a = act(
      act(act(start(), { type: 'select', optionId: 'a' }), {
        type: 'save-and-next',
      }),
      { type: 'submit' },
    );
    const restored = restoreTimedAttempt(
      serializeTimedAttempt(a),
      context,
      999999,
    );
    expect(restored).toEqual(a);
    expect(scoreSubmittedAttempt(restored, keys)).toEqual(
      scoreSubmittedAttempt(a, keys),
    );
  });

  it.each([
    (a: Record<string, unknown>) => {
      a.schemaVersion = '2.0';
    },
    (a: Record<string, unknown>) => {
      a.startedAtMs = 0;
    },
    (a: Record<string, unknown>) => {
      a.activeSectionIndex = 3;
    },
    (a: Record<string, unknown>) => {
      a.submittedAtMs = 2000;
    },
    (a: Record<string, unknown>) => {
      a.profileSnapshot = {};
    },
    (a: Record<string, unknown>) => {
      a.questionSnapshots = [];
    },
    (a: Record<string, unknown>) => {
      a.schedule = [];
    },
  ])('rejects inconsistent/corrupt persisted metadata (%#)', (corrupt) => {
    const a = JSON.parse(serializeTimedAttempt(start()));
    corrupt(a);
    expect(() =>
      restoreTimedAttempt(JSON.stringify(a), context, 5000),
    ).toThrow();
  });

  it('rejects malformed JSON, stale question revisions, invalid options/IDs and future visits', () => {
    expect(() => restoreTimedAttempt('{broken', context, 2000)).toThrow();
    const valid = act(act(start(), { type: 'select', optionId: 'a' }), {
      type: 'save-and-next',
    });
    for (const mutate of [
      (a: TimedAttempt) => {
        a.questionSnapshots[0]!.revision += 1;
      },
      (a: TimedAttempt) => {
        a.session = {
          ...a.session,
          savedResponses: {
            ...a.session.savedResponses,
            [firstId]: {
              ...a.session.savedResponses[firstId]!,
              selectedOptionId: 'invalid',
            },
          },
        };
      },
      (a: TimedAttempt) => {
        a.session = {
          ...a.session,
          visitedQuestionIds: [
            ...a.session.visitedQuestionIds,
            context.questions[9]!.id,
          ],
        };
      },
      (a: TimedAttempt) => {
        a.session = { ...a.session, activeQuestionId: 'unknown' };
      },
    ]) {
      const copy = structuredClone(valid);
      mutate(copy);
      expect(() =>
        restoreTimedAttempt(serializeTimedAttempt(copy), context, 3000),
      ).toThrow();
    }
  });
});

describe('pure objective scoring', () => {
  function submittedMixed() {
    let a = act(act(start(), { type: 'select', optionId: 'a' }), {
      type: 'review-and-next',
    });
    a = act(act(a, { type: 'select', optionId: 'a' }), {
      type: 'save-and-next',
    });
    a = act(a, { type: 'review-and-next' });
    return act(a, { type: 'submit' });
  }
  it('scores reviewed saved answers, wrong answers and unanswered review flags accurately', () => {
    const result = scoreSubmittedAttempt(submittedMixed(), keys);
    expect(result).toMatchObject({
      score: 0.75,
      maximumMarks: 12,
      correct: 1,
      incorrect: 1,
      unanswered: 10,
      attempted: 2,
      accuracy: 50,
    });
    expect(result.questions[2]!.outcome).toBe('unanswered');
    expect(result.sections[0]).toMatchObject({
      score: 0.75,
      attempted: 2,
      correct: 1,
      incorrect: 1,
      unanswered: 1,
    });
    expect(result.sections.reduce((sum, s) => sum + s.score, 0)).toBe(
      result.score,
    );
    expect(result.sections.reduce((sum, s) => sum + s.attempted, 0)).toBe(
      result.attempted,
    );
  });

  it('supports decimal/zero penalties without floating-point score artifacts', () => {
    const a = submittedMixed();
    a.questionSnapshots[0]!.marks = 0.3;
    a.questionSnapshots[1]!.negativeMarks = 0.1;
    expect(scoreSubmittedAttempt(a, keys).score).toBe(0.2);
    a.questionSnapshots[1]!.negativeMarks = 0;
    expect(scoreSubmittedAttempt(a, keys).score).toBe(0.3);
  });

  it('handles no attempts and rejects pre-submit scoring, unknown responses, stale or missing keys', () => {
    expect(() => scoreSubmittedAttempt(start(), keys)).toThrow(/until final/);
    const a = act(start(), { type: 'submit' });
    expect(scoreSubmittedAttempt(a, keys)).toMatchObject({
      score: 0,
      attempted: 0,
      accuracy: 0,
      unanswered: 12,
    });
    expect(() => scoreSubmittedAttempt(a, keys.slice(1))).toThrow(/key/);
    expect(() =>
      scoreSubmittedAttempt(a, [
        { ...keys[0]!, revision: 99 },
        ...keys.slice(1),
      ]),
    ).toThrow(/key/);
    const mixed = submittedMixed();
    mixed.session = {
      ...mixed.session,
      savedResponses: { bad: mixed.session.savedResponses[firstId]! },
    };
    expect(() => scoreSubmittedAttempt(mixed, keys)).toThrow(/Saved response/);
  });

  it('validates original demo keys without approving them as scored PYQs', () => {
    expect(
      keys.every(
        (q) =>
          q.source.category === 'original-practice' &&
          q.approvalStatus === 'pending',
      ),
    ).toBe(true);
    const invalid = structuredClone(runtimeDemoRecords);
    invalid[0]!.correctOptionId = 'not-an-option';
    expect(() => createDemoScoringRepository(invalid)).toThrow();
    expect(() =>
      createDemoScoringRepository([
        ...runtimeDemoRecords,
        runtimeDemoRecords[0],
      ]),
    ).toThrow(/Duplicate/);
  });
});
