import { z } from 'zod';
import type { QuestionRepository } from '../../features/questions/question-repository';
import { verifiedPyqSchema } from '../../schemas/question';
import rawCatalog from './verified-pyqs.json';

const catalogSchema = z
  .array(verifiedPyqSchema)
  .superRefine((questions, ctx) => {
    const ids = new Set<string>();
    for (const question of questions) {
      if (ids.has(question.id)) {
        ctx.addIssue({
          code: 'custom',
          message: `Duplicate question ID: ${question.id}`,
        });
      }
      ids.add(question.id);
    }
  });

/** Fail the whole load on invalid input; never silently drop or promote records. */
export function createLocalQuestionRepository(
  input: unknown,
): QuestionRepository {
  const questions = catalogSchema.parse(input);
  return {
    listVerifiedPyqs: () => structuredClone(questions),
  };
}

export const localQuestionRepository =
  createLocalQuestionRepository(rawCatalog);
