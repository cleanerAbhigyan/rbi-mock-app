import { pointsSchema } from '../../../schemas/timed-attempt';
import type { DemoScoringRecord } from '../../../data/demo/demo-scoring-repository';
import type { TimedAttempt } from './engine';

/** Integer hundredths avoid artifacts from decimal penalties. Does not inspect drafts/review flags. */
export function scoreSubmittedAttempt(
  attempt: TimedAttempt,
  keys: readonly DemoScoringRecord[],
) {
  if (attempt.status !== 'submitted')
    throw new Error('Results are unavailable until final submission.');
  const keyMap = new Map(keys.map((key) => [key.id, key]));
  if (keyMap.size !== keys.length) throw new Error('Duplicate answer keys.');
  const snapshotMap = new Map(attempt.questionSnapshots.map((q) => [q.id, q]));
  if (snapshotMap.size !== attempt.questionSnapshots.length)
    throw new Error('Duplicate attempt question IDs.');
  for (const [id, response] of Object.entries(attempt.session.savedResponses)) {
    const question = snapshotMap.get(id);
    if (
      !question ||
      response.questionId !== id ||
      response.questionRevision !== question.revision ||
      !question.options.some((o) => o.id === response.selectedOptionId)
    )
      throw new Error('Saved response does not match the attempt.');
  }
  const questions = attempt.questionSnapshots.map((question) => {
    const key = keyMap.get(question.id);
    if (
      !key ||
      key.revision !== question.revision ||
      !question.options.some((o) => o.id === key.correctOptionId)
    )
      throw new Error('Missing or stale answer key.');
    const marks = pointsSchema.parse(question.marks);
    const penalty = pointsSchema.parse(question.negativeMarks);
    if (marks <= 0 || penalty > marks)
      throw new Error('Invalid scoring weights.');
    const saved = attempt.session.savedResponses[question.id];
    const outcome = saved
      ? saved.selectedOptionId === key.correctOptionId
        ? 'correct'
        : 'incorrect'
      : 'unanswered';
    const scoreUnits =
      outcome === 'correct'
        ? Math.round(marks * 100)
        : outcome === 'incorrect'
          ? -Math.round(penalty * 100)
          : 0;
    return {
      ...question,
      selectedOptionId: saved?.selectedOptionId ?? null,
      correctOptionId: key.correctOptionId,
      explanation: key.explanation,
      outcome,
      scoreUnits,
      score: scoreUnits / 100,
    };
  });
  function summarize(items: typeof questions) {
    const correct = items.filter((q) => q.outcome === 'correct').length;
    const incorrect = items.filter((q) => q.outcome === 'incorrect').length;
    const attempted = correct + incorrect;
    return {
      score: items.reduce((sum, q) => sum + q.scoreUnits, 0) / 100,
      maximumMarks:
        items.reduce((sum, q) => sum + Math.round(q.marks * 100), 0) / 100,
      correct,
      incorrect,
      unanswered: items.length - attempted,
      attempted,
      accuracy: attempted ? Math.round((correct / attempted) * 10000) / 100 : 0,
    };
  }
  return {
    attemptId: attempt.id,
    ...summarize(questions),
    questions,
    sections: attempt.profileSnapshot.sections.map((section) => ({
      id: section.id,
      title: section.title,
      ...summarize(questions.filter((q) => q.sectionId === section.id)),
    })),
  };
}
