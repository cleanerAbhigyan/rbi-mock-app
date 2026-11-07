import type { ObjectiveQuestion } from '../../schemas/question';

/** Original synthetic test content. Never import this module into the application. */
export const developerQuestions: ObjectiveQuestion[] = [
  {
    schemaVersion: '1.0',
    kind: 'objective',
    id: 'fixture-original-arithmetic-001',
    revision: 1,
    exam: 'RBI Grade B (DR-General)',
    phase: 'phase-i',
    paperOrSection: 'Synthetic arithmetic tests',
    year: null,
    text: 'Synthetic developer fixture: What is 2 + 3?',
    options: [
      { id: 'a', text: '4' },
      { id: 'b', text: '5' },
      { id: 'c', text: '6' },
    ],
    correctOptionId: 'b',
    explanation:
      'Adding two and three gives five. Original test content, not a PYQ.',
    topic: 'Arithmetic',
    subtopic: 'Addition',
    marks: 1,
    negativeMarks: 0,
    usage: 'developer-fixture',
    source: {
      category: 'original-practice',
      reference:
        'Original synthetic developer fixture authored for this repository.',
      originalQuestionNumber: null,
      answerKeyReference: 'Developer arithmetic check: 2 + 3 = 5.',
    },
    verificationStatus: 'verified',
    approvalStatus: 'approved',
  },
  {
    schemaVersion: '1.0',
    kind: 'objective',
    id: 'fixture-original-vocabulary-001',
    revision: 1,
    exam: 'RBI Grade B (DR-General)',
    phase: 'phase-i',
    paperOrSection: 'Synthetic vocabulary tests',
    year: null,
    text: 'Synthetic developer fixture: Which word is the opposite of hot?',
    options: [
      { id: 'a', text: 'Warm' },
      { id: 'b', text: 'Cold' },
    ],
    correctOptionId: 'b',
    explanation:
      'Cold is the opposite of hot. Original test content, not a PYQ.',
    topic: 'Vocabulary',
    subtopic: 'Antonyms',
    marks: 1,
    negativeMarks: 0,
    usage: 'developer-fixture',
    source: {
      category: 'original-practice',
      reference:
        'Original synthetic developer fixture authored for this repository.',
      originalQuestionNumber: null,
      answerKeyReference: 'Developer vocabulary review.',
    },
    verificationStatus: 'verified',
    approvalStatus: 'approved',
  },
];
