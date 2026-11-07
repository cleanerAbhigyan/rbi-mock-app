import type { DemoQuestion } from '../questions/demo-question-repository';
import type {
  DraftResponse,
  QuestionStatus,
  ReviewFlag,
  SavedResponse,
} from '../../types/exam';

/** Untimed interaction state. Intentionally separate from future timed ExamAttempt. */
export interface DemoSession {
  profileId: string;
  activeQuestionId: string;
  visitedQuestionIds: readonly string[];
  draft: DraftResponse;
  savedResponses: Readonly<Record<string, SavedResponse>>;
  reviewFlags: Readonly<Record<string, ReviewFlag>>;
}

export type DemoAction =
  | { type: 'navigate'; questionId: string }
  | { type: 'move'; direction: -1 | 1 }
  | { type: 'select'; optionId: string }
  | { type: 'save-and-next'; savedAt: string }
  | { type: 'review-and-next'; savedAt: string }
  | { type: 'clear' | 'remove-review' | 'discard-draft' };

export type DemoCommand =
  | Exclude<DemoAction, { savedAt: string }>
  | { type: 'save-and-next' }
  | { type: 'review-and-next' };

export function startDemoSession(
  profileId: string,
  questions: readonly DemoQuestion[],
): DemoSession {
  const first = questions[0];
  if (!first) throw new Error('Cannot start a demo without questions.');
  return {
    profileId,
    activeQuestionId: first.id,
    visitedQuestionIds: [first.id],
    draft: { questionId: first.id, selectedOptionId: null },
    savedResponses: {},
    reviewFlags: {},
  };
}

function restoreDraft(session: DemoSession): DemoSession {
  return {
    ...session,
    draft: {
      questionId: session.activeQuestionId,
      selectedOptionId:
        session.savedResponses[session.activeQuestionId]?.selectedOptionId ??
        null,
    },
  };
}

function navigate(
  session: DemoSession,
  questionId: string,
  questions: readonly DemoQuestion[],
): DemoSession {
  if (
    questionId === session.activeQuestionId ||
    !questions.some((question) => question.id === questionId)
  )
    return session;
  return restoreDraft({
    ...session,
    activeQuestionId: questionId,
    visitedQuestionIds: session.visitedQuestionIds.includes(questionId)
      ? session.visitedQuestionIds
      : [...session.visitedQuestionIds, questionId],
  });
}

function move(
  session: DemoSession,
  direction: -1 | 1,
  questions: readonly DemoQuestion[],
): DemoSession {
  const index = questions.findIndex(
    (question) => question.id === session.activeQuestionId,
  );
  const next = questions[index + direction];
  return next ? navigate(session, next.id, questions) : session;
}

/** Pure immutable transitions. Save timestamps are supplied by the store, not generated here. */
export function transitionDemoSession(
  session: DemoSession,
  action: DemoAction,
  questions: readonly DemoQuestion[],
): DemoSession {
  const question = questions.find(
    (item) => item.id === session.activeQuestionId,
  );
  if (!question) return session;
  switch (action.type) {
    case 'navigate':
      return navigate(session, action.questionId, questions);
    case 'move':
      return move(session, action.direction, questions);
    case 'select':
      return question.options.some((option) => option.id === action.optionId)
        ? {
            ...session,
            draft: {
              questionId: question.id,
              selectedOptionId: action.optionId,
            },
          }
        : session;
    case 'save-and-next':
    case 'review-and-next': {
      const selectedOptionId = session.draft.selectedOptionId;
      const committed =
        selectedOptionId === null
          ? session
          : {
              ...session,
              savedResponses: {
                ...session.savedResponses,
                [question.id]: {
                  questionId: question.id,
                  questionRevision: question.revision,
                  selectedOptionId,
                  savedAt: action.savedAt,
                },
              },
            };
      const marked =
        action.type === 'review-and-next'
          ? {
              ...committed,
              reviewFlags: {
                ...committed.reviewFlags,
                [question.id]: 'marked-for-review' as const,
              },
            }
          : committed;
      return move(marked, 1, questions);
    }
    case 'clear': {
      const savedResponses = { ...session.savedResponses };
      delete savedResponses[question.id];
      return {
        ...session,
        savedResponses,
        draft: { questionId: question.id, selectedOptionId: null },
      };
    }
    case 'remove-review': {
      const reviewFlags = { ...session.reviewFlags };
      delete reviewFlags[question.id];
      return { ...session, reviewFlags };
    }
    case 'discard-draft':
      return restoreDraft(session);
  }
}

export function deriveQuestionStatus(
  session: DemoSession,
  questionId: string,
): QuestionStatus {
  const answered = session.savedResponses[questionId] !== undefined;
  if (session.reviewFlags[questionId] === 'marked-for-review') {
    return answered
      ? 'answered-and-marked-for-review'
      : 'marked-for-review-without-answer';
  }
  if (answered) return 'answered';
  return session.visitedQuestionIds.includes(questionId)
    ? 'not-answered'
    : 'not-visited';
}

export function countQuestionStatuses(
  session: DemoSession,
  questionIds: readonly string[],
): Record<QuestionStatus, number> {
  const counts: Record<QuestionStatus, number> = {
    'not-visited': 0,
    'not-answered': 0,
    answered: 0,
    'marked-for-review-without-answer': 0,
    'answered-and-marked-for-review': 0,
  };
  for (const id of questionIds) counts[deriveQuestionStatus(session, id)] += 1;
  return counts;
}
