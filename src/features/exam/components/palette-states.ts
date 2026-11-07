import type { QuestionStatus } from '../../../types/exam';

export const paletteStates: Record<
  QuestionStatus,
  { label: string; symbol: string }
> = {
  'not-visited': { label: 'Not Visited', symbol: '·' },
  'not-answered': { label: 'Not Answered', symbol: '—' },
  answered: { label: 'Answered', symbol: '✓' },
  'marked-for-review-without-answer': {
    label: 'Marked for Review — Not Answered',
    symbol: 'R',
  },
  'answered-and-marked-for-review': {
    label: 'Answered and Marked for Review',
    symbol: 'R✓',
  },
};
