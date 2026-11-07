import type { VerifiedPyq } from '../../schemas/question';

/** Consumers receive validated records; raw file contents never cross this boundary. */
export interface QuestionRepository {
  listVerifiedPyqs(): readonly VerifiedPyq[];
}
