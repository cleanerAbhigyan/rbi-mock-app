/** Shared contracts: no official timing, scoring, or 2027 profile is supplied. */
export type QuestionStatus =
  | 'not-visited'
  | 'not-answered'
  | 'answered'
  | 'marked-for-review-without-answer'
  | 'answered-and-marked-for-review';

export type ReviewFlag = 'none' | 'marked-for-review';

export interface ExamSection {
  id: string;
  title: string;
  questionIds: readonly string[];
  /** null explicitly represents untimed practice; never infer an official duration. */
  durationSeconds: number | null;
  navigation: 'free' | 'sequential-locked';
}

export interface ExamProfile {
  id: string;
  revision: number;
  exam: 'RBI Grade B (DR-General)';
  phase: 'phase-i' | 'phase-ii' | 'sectional-practice';
  label: string;
  year: number | null;
  source:
    | { status: 'awaiting-official-notification'; reference: null }
    | { status: 'verified-reference' | 'custom-practice'; reference: string };
  sections: readonly ExamSection[];
}

/** Ephemeral choice. Navigation must not implicitly turn this into SavedResponse. */
export interface DraftResponse {
  questionId: string;
  selectedOptionId: string | null;
}

/** Only explicitly committed choices are eligible for future objective scoring. */
export interface SavedResponse {
  questionId: string;
  questionRevision: number;
  selectedOptionId: string;
  savedAt: string;
}

export interface ExamAttempt {
  id: string;
  profileSnapshot: ExamProfile;
  questionSnapshots: readonly {
    questionId: string;
    revision: number;
    marks: number;
    negativeMarks: number;
  }[];
  status: 'in-progress' | 'submitted';
  startedAt: string;
  deadlineAt: string;
  submittedAt: string | null;
  savedResponses: Readonly<Record<string, SavedResponse>>;
  visitedQuestionIds: readonly string[];
  reviewFlags: Readonly<Record<string, ReviewFlag>>;
}

export interface ExamResult {
  attemptId: string;
  submittedAt: string;
  totalMarks: number;
  maximumMarks: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  sectionResults: readonly {
    sectionId: string;
    marks: number;
    maximumMarks: number;
    correct: number;
    incorrect: number;
    unanswered: number;
  }[];
}
