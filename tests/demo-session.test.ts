import { describe, expect, it } from 'vitest';
import { demoProfile, demoQuestions } from '../src/features/exam/demo-profile';
import {
  countQuestionStatuses,
  deriveQuestionStatus,
  startDemoSession,
  transitionDemoSession,
} from '../src/features/exam/demo-session';
import type {
  DemoAction,
  DemoSession,
} from '../src/features/exam/demo-session';

const first = demoQuestions[0]!;
const second = demoQuestions[1]!;
const timestamp = '2026-11-07T20:00:00.000Z';
const start = () => startDemoSession(demoProfile.id, demoQuestions);
const act = (session: DemoSession, action: DemoAction) =>
  transitionDemoSession(session, action, demoQuestions);
const select = (session: DemoSession, optionId = 'a') =>
  act(session, { type: 'select', optionId });
const visit = (session: DemoSession, questionId: string) =>
  act(session, { type: 'navigate', questionId });
const save = (session: DemoSession) =>
  act(session, { type: 'save-and-next', savedAt: timestamp });
const review = (session: DemoSession) =>
  act(session, { type: 'review-and-next', savedAt: timestamp });

describe('pure demo-session transitions', () => {
  it('starts at the first question with only that question visited and no committed choices', () => {
    const session = start();
    expect(session.activeQuestionId).toBe(first.id);
    expect(session.visitedQuestionIds).toEqual([first.id]);
    expect(session.draft).toEqual({
      questionId: first.id,
      selectedOptionId: null,
    });
    expect(session.savedResponses).toEqual({});
    expect(session.reviewFlags).toEqual({});
    expect(deriveQuestionStatus(session, first.id)).toBe('not-answered');
    expect(deriveQuestionStatus(session, second.id)).toBe('not-visited');
    expect(() => startDemoSession('empty', [])).toThrow(/without questions/);
  });

  it('selects a draft without mutating the prior state, saved responses or answered count', () => {
    const before = start();
    const after = select(before);
    expect(after.draft.selectedOptionId).toBe('a');
    expect(before.draft.selectedOptionId).toBeNull();
    expect(after.savedResponses).toEqual({});
    expect(deriveQuestionStatus(after, first.id)).toBe('not-answered');
    expect(countQuestionStatuses(after, [first.id, second.id])).toEqual({
      'not-visited': 1,
      'not-answered': 1,
      answered: 0,
      'marked-for-review-without-answer': 0,
      'answered-and-marked-for-review': 0,
    });
  });

  it('discards a draft on palette navigation and visits the target exactly once', () => {
    const after = visit(select(start()), second.id);
    expect(after.savedResponses).toEqual({});
    expect(after.draft).toEqual({
      questionId: second.id,
      selectedOptionId: null,
    });
    const returned = visit(visit(after, first.id), second.id);
    expect(returned.visitedQuestionIds).toEqual([first.id, second.id]);
    expect(returned.draft.selectedOptionId).toBeNull();
  });

  it('Save & Next commits ID, revision and timestamp before moving to the next question', () => {
    const saved = save(select(start(), 'b'));
    expect(saved.activeQuestionId).toBe(second.id);
    expect(saved.savedResponses).toEqual({
      [first.id]: {
        questionId: first.id,
        questionRevision: first.revision,
        selectedOptionId: 'b',
        savedAt: timestamp,
      },
    });
    expect(deriveQuestionStatus(saved, first.id)).toBe('answered');
    expect(visit(saved, first.id).draft.selectedOptionId).toBe('b');
  });

  it('saving without a choice advances without inventing a committed response', () => {
    const session = save(start());
    expect(session.activeQuestionId).toBe(second.id);
    expect(session.savedResponses).toEqual({});
    expect(deriveQuestionStatus(session, first.id)).toBe('not-answered');
  });

  it('marks without an answer and marks with a saved answer using distinct statuses', () => {
    const unanswered = review(start());
    const answered = review(select(start(), 'c'));
    expect(deriveQuestionStatus(unanswered, first.id)).toBe(
      'marked-for-review-without-answer',
    );
    expect(unanswered.savedResponses[first.id]).toBeUndefined();
    expect(deriveQuestionStatus(answered, first.id)).toBe(
      'answered-and-marked-for-review',
    );
    expect(answered.savedResponses[first.id]?.selectedOptionId).toBe('c');
    expect(answered.activeQuestionId).toBe(second.id);
  });

  it('restores a saved choice after discarding a different unsaved edit', () => {
    const committed = visit(save(select(start(), 'a')), first.id);
    const edited = select(committed, 'd');
    expect(edited.savedResponses[first.id]?.selectedOptionId).toBe('a');
    const returned = visit(visit(edited, second.id), first.id);
    expect(returned.draft.selectedOptionId).toBe('a');
    expect(returned.savedResponses[first.id]).toEqual(
      committed.savedResponses[first.id],
    );
  });

  it('removes a review flag without changing either saved or draft answers', () => {
    const marked = select(visit(review(select(start(), 'a')), first.id), 'd');
    const unmarked = act(marked, { type: 'remove-review' });
    expect(unmarked.savedResponses).toEqual(marked.savedResponses);
    expect(unmarked.draft).toEqual(marked.draft);
    expect(deriveQuestionStatus(unmarked, first.id)).toBe('answered');
    expect(deriveQuestionStatus(marked, first.id)).toBe(
      'answered-and-marked-for-review',
    );
  });

  it('Save & Next preserves an existing review flag', () => {
    const session = save(select(visit(review(start()), first.id)));
    expect(deriveQuestionStatus(session, first.id)).toBe(
      'answered-and-marked-for-review',
    );
  });

  it('clears only the active draft and saved response, preserving its review flag and other questions', () => {
    const firstSaved = review(select(start()));
    const twoSaved = save(select(firstSaved, 'b'));
    const active = select(visit(twoSaved, first.id), 'c');
    const cleared = act(active, { type: 'clear' });
    expect(cleared.draft.selectedOptionId).toBeNull();
    expect(cleared.savedResponses[first.id]).toBeUndefined();
    expect(cleared.savedResponses[second.id]).toEqual(
      twoSaved.savedResponses[second.id],
    );
    expect(cleared.reviewFlags).toEqual(active.reviewFlags);
    expect(deriveQuestionStatus(cleared, first.id)).toBe(
      'marked-for-review-without-answer',
    );
    const unmarked = act(cleared, { type: 'remove-review' });
    expect(deriveQuestionStatus(unmarked, first.id)).toBe('not-answered');
  });

  it('derives all five states and counts from one coherent session without storing status values', () => {
    let session = save(select(start()));
    session = review(session);
    session = review(select(session));
    const ids = demoQuestions.map((question) => question.id);
    expect(
      ids.slice(0, 5).map((id) => deriveQuestionStatus(session, id)),
    ).toEqual([
      'answered',
      'marked-for-review-without-answer',
      'answered-and-marked-for-review',
      'not-answered',
      'not-visited',
    ]);
    const counts = countQuestionStatuses(session, ids);
    expect(counts).toEqual({
      answered: 1,
      'marked-for-review-without-answer': 1,
      'answered-and-marked-for-review': 1,
      'not-answered': 1,
      'not-visited': 8,
    });
    expect(Object.values(counts).reduce((a, b) => a + b, 0)).toBe(12);
    expect(
      countQuestionStatuses(session, demoProfile.sections[0]!.questionIds),
    ).toEqual({
      answered: 1,
      'marked-for-review-without-answer': 1,
      'answered-and-marked-for-review': 1,
      'not-answered': 0,
      'not-visited': 0,
    });
  });

  it('crosses section boundaries without saving drafts or losing committed choices', () => {
    const lastInFirst = demoQuestions[2]!;
    const firstInSecond = demoQuestions[3]!;
    const session = select(visit(save(select(start())), lastInFirst.id));
    const next = act(session, { type: 'move', direction: 1 });
    expect(next.activeQuestionId).toBe(firstInSecond.id);
    expect(next.savedResponses[lastInFirst.id]).toBeUndefined();
    expect(next.savedResponses[first.id]?.selectedOptionId).toBe('a');
    expect(act(next, { type: 'move', direction: -1 }).activeQuestionId).toBe(
      lastInFirst.id,
    );
    expect(save(session).savedResponses[lastInFirst.id]?.selectedOptionId).toBe(
      'a',
    );
  });

  it('has safe first/last boundaries and never submits or wraps after the final question', () => {
    const initial = select(start());
    expect(act(initial, { type: 'move', direction: -1 })).toBe(initial);
    const last = demoQuestions.at(-1)!;
    const final = select(visit(initial, last.id));
    expect(act(final, { type: 'move', direction: 1 })).toBe(final);
    for (const result of [save(final), review(final)]) {
      expect(result.activeQuestionId).toBe(last.id);
      expect(result.savedResponses[last.id]?.selectedOptionId).toBe('a');
      expect(result).not.toHaveProperty('submittedAt');
      expect(result).not.toHaveProperty('deadlineAt');
    }
  });

  it('ignores invalid IDs/options and keeps the draft when clicking the current palette item', () => {
    const session = select(start());
    expect(visit(session, 'not-a-question')).toBe(session);
    expect(visit(session, session.activeQuestionId)).toBe(session);
    expect(select(session, 'not-an-option')).toBe(session);
  });

  it('discards draft edits on leaving the editor while retaining saved answers and flags', () => {
    const session = select(visit(review(select(start(), 'b')), first.id), 'd');
    const restored = act(session, { type: 'discard-draft' });
    expect(restored.draft.selectedOptionId).toBe('b');
    expect(restored.savedResponses).toEqual(session.savedResponses);
    expect(restored.reviewFlags).toEqual(session.reviewFlags);
  });
});
