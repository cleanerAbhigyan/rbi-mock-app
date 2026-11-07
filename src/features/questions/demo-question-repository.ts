import type { ObjectiveQuestion } from '../../schemas/question';

/** Candidate-facing data intentionally excludes keys, explanations and topic hints. */
export type DemoQuestion = Pick<
  ObjectiveQuestion,
  | 'id'
  | 'revision'
  | 'paperOrSection'
  | 'text'
  | 'options'
  | 'marks'
  | 'negativeMarks'
>;

/** Kept separate from QuestionRepository.listVerifiedPyqs(). */
export interface DemoQuestionRepository {
  listDemoQuestions(): readonly DemoQuestion[];
}
